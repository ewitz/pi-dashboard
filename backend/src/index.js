const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;
const DIST_PATH = path.join(__dirname, '../../frontend/dist');

app.use(express.json());

// Serve frontend in production
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
      res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
  });
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Track previous network stats for calculating speeds
let prevNetStats = null;
let prevNetTime = null;

// THROTTLED bit meanings (vcgencmd get_throttled)
const THROTTLED_BITS = {
  underVoltageNow:    1 << 0,
  freqCappedNow:      1 << 1,
  throttledNow:       1 << 2,
  softTempLimitNow:   1 << 3,
  underVoltageOccurred:    1 << 16,
  freqCappedOccurred:      1 << 17,
  throttledOccurred:       1 << 18,
  softTempLimitOccurred:   1 << 19,
};

async function getPowerInfo() {
  const { execSync } = require('child_process');
  const result = {
    available: false,
    throttledRaw: null,
    flags: {},
    rails: [],
    summary: 'unknown',
  };

  // throttled status
  try {
    const out = execSync('vcgencmd get_throttled 2>/dev/null', { timeout: 800 }).toString();
    const m = out.match(/throttled=0x([\da-fA-F]+)/);
    if (m) {
      const value = parseInt(m[1], 16);
      result.available = true;
      result.throttledRaw = '0x' + value.toString(16);
      const flags = {};
      for (const [k, bit] of Object.entries(THROTTLED_BITS)) {
        flags[k] = (value & bit) !== 0;
      }
      result.flags = flags;
      if (flags.underVoltageNow) result.summary = 'undervoltage';
      else if (flags.throttledNow || flags.freqCappedNow || flags.softTempLimitNow) result.summary = 'throttling';
      else if (flags.underVoltageOccurred || flags.throttledOccurred || flags.freqCappedOccurred || flags.softTempLimitOccurred) result.summary = 'past-event';
      else result.summary = 'ok';
    }
  } catch (_) {}

  // PMIC voltage rails (Pi 5 has these; Pi 4 may not)
  try {
    const out = execSync('vcgencmd pmic_read_adc 2>/dev/null', { timeout: 800 }).toString();
    const volts = {};
    const amps = {};
    out.split('\n').forEach(line => {
      let m = line.match(/^\s*(\S+?)_V\s+volt\(\d+\)=([\d.]+)V/);
      if (m) volts[m[1]] = parseFloat(m[2]);
      m = line.match(/^\s*(\S+?)_A\s+current\(\d+\)=([\d.]+)A/);
      if (m) amps[m[1]] = parseFloat(m[2]);
    });
    const railNames = Object.keys(volts);
    result.rails = railNames.map(name => ({
      name,
      volts: volts[name],
      amps: amps[name] ?? null,
      watts: amps[name] != null ? volts[name] * amps[name] : null,
    }));
    result.totalWatts = result.rails.reduce((s, r) => s + (r.watts || 0), 0);
    result.available = true;
  } catch (_) {}

  return result;
}

async function getCpuTemperature() {
  // Try /sys/class/thermal first (most reliable on Pi)
  try {
    const raw = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8').trim();
    const temp = parseInt(raw, 10) / 1000;
    if (!isNaN(temp) && temp > 0) return temp;
  } catch (_) {}

  // Try vcgencmd
  try {
    const { execSync } = require('child_process');
    const out = execSync('vcgencmd measure_temp 2>/dev/null', { timeout: 1000 }).toString();
    const match = out.match(/temp=([\d.]+)/);
    if (match) return parseFloat(match[1]);
  } catch (_) {}

  // Fall back to systeminformation
  try {
    const tempData = await si.cpuTemperature();
    return tempData.main || tempData.max || 0;
  } catch (_) {
    return 0;
  }
}

async function collectMetrics() {
  const now = Date.now();

  const [
    cpuLoad,
    cpuCurrentSpeed,
    mem,
    fsSize,
    blockDevices,
    diskLayout,
    networkStats,
    osInfo,
    processes,
  ] = await Promise.all([
    si.currentLoad(),
    si.cpuCurrentSpeed(),
    si.mem(),
    si.fsSize(),
    si.blockDevices(),
    si.diskLayout(),
    si.networkStats(),
    si.osInfo(),
    si.processes(),
  ]);

  const temperature = await getCpuTemperature();
  const power = await getPowerInfo();

  // Calculate network speeds (bytes/sec)
  let networkWithSpeeds = networkStats.map(iface => ({
    iface: iface.iface,
    rx: iface.rx_bytes,
    tx: iface.tx_bytes,
    rxSec: 0,
    txSec: 0,
  }));

  if (prevNetStats && prevNetTime) {
    const dt = (now - prevNetTime) / 1000;
    if (dt > 0) {
      networkWithSpeeds = networkStats.map(iface => {
        const prev = prevNetStats.find(p => p.iface === iface.iface);
        let rxSec = 0;
        let txSec = 0;
        if (prev) {
          rxSec = Math.max(0, (iface.rx_bytes - prev.rx) / dt);
          txSec = Math.max(0, (iface.tx_bytes - prev.tx) / dt);
        }
        return {
          iface: iface.iface,
          rx: iface.rx_bytes,
          tx: iface.tx_bytes,
          rxSec,
          txSec,
        };
      });
    }
  }

  prevNetStats = networkStats.map(n => ({ iface: n.iface, rx: n.rx_bytes, tx: n.tx_bytes }));
  prevNetTime = now;

  // Load averages from os module
  const loadavg = require('os').loadavg();

  // Filter out useless filesystems
  const usefulFs = (fsSize || []).filter(f =>
    f.size > 0 && f.mount && !f.mount.startsWith('/sys') && !f.mount.startsWith('/proc') && !f.mount.startsWith('/dev/pts')
  );

  return {
    timestamp: now,
    cpu: {
      usage: cpuLoad.currentLoad ?? 0,
      cores: (cpuLoad.cpus || []).map(c => c.load ?? 0),
      speed: cpuCurrentSpeed.avg ?? cpuCurrentSpeed.min ?? 0,
      temperature,
    },
    memory: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      available: mem.available,
      percent: mem.total > 0 ? (mem.used / mem.total) * 100 : 0,
      swapTotal: mem.swaptotal,
      swapUsed: mem.swapused,
      swapPercent: mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0,
    },
    disk: usefulFs.map(f => ({
      fs: f.fs,
      mount: f.mount,
      size: f.size,
      used: f.used,
      available: f.available,
      percent: f.use ?? 0,
    })),
    drives: (diskLayout || []).filter(d => {
      const dev = (d.device || '');
      // Drop kernel ramdisks/loop/zram clutter
      return !/\/(ram|loop|zram)\d+/.test(dev) && (d.size || 0) > 0;
    }).map(d => {
      // Match block-device children to find partitions/mounts for this physical disk
      const devName = (d.device || '').replace(/^\/dev\//, '');
      const parts = (blockDevices || []).filter(b =>
        b.name && b.name.startsWith(devName) && b.name !== devName
      );
      const mounts = parts
        .map(p => p.mount)
        .filter(Boolean);
      // Aggregate used/size from any mounted filesystems on this physical disk
      const matchedFs = (usefulFs || []).filter(f =>
        parts.some(p => f.fs && (f.fs === '/dev/' + p.name || f.fs.endsWith('/' + p.name)))
      );
      const usedBytes = matchedFs.reduce((s, f) => s + (f.used || 0), 0);
      return {
        device: d.device,
        name: d.name || '',
        vendor: d.vendor || '',
        type: d.type || '',
        interfaceType: d.interfaceType || '',
        size: d.size || 0,
        serial: d.serialNum || '',
        temperature: d.temperature ?? null,
        smartStatus: d.smartStatus || 'unknown',
        partitions: parts.length,
        mounts,
        mounted: mounts.length > 0,
        usedBytes,
        usedPercent: d.size > 0 ? (usedBytes / d.size) * 100 : 0,
      };
    }),
    network: networkWithSpeeds.filter(n => n.iface && !n.iface.startsWith('lo')),
    power,
    system: {
      uptime: require('os').uptime(),
      loadAvg: [loadavg[0], loadavg[1], loadavg[2]],
      hostname: osInfo.hostname || require('os').hostname(),
      os: `${osInfo.distro || osInfo.platform} ${osInfo.release || ''}`.trim(),
      kernel: osInfo.kernel || '',
      processes: processes.all || 0,
    },
  };
}

// Broadcast metrics to all connected clients every 2 seconds
async function broadcast() {
  if (wss.clients.size === 0) return;
  try {
    const metrics = await collectMetrics();
    const payload = JSON.stringify(metrics);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  } catch (err) {
    console.error('Error collecting metrics:', err.message);
  }
}

setInterval(broadcast, 2000);

wss.on('connection', async (ws) => {
  console.log('Client connected');
  // Send initial data immediately
  try {
    const metrics = await collectMetrics();
    ws.send(JSON.stringify(metrics));
  } catch (err) {
    console.error('Error on initial send:', err.message);
  }

  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', err => console.error('WebSocket error:', err.message));
});

server.listen(PORT, () => {
  console.log(`Pi Dashboard running on http://localhost:${PORT}`);
  console.log(`Frontend dist: ${fs.existsSync(DIST_PATH) ? DIST_PATH : '(not built)'}`);
});
