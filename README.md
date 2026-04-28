# Pi Dashboard

A real-time Raspberry Pi system monitoring dashboard built with React + Node.js. Displays live metrics including CPU usage, temperature, RAM, disk, and network — all in a modern dark-themed UI with live sparkline charts.

## Screenshot

The dashboard features a responsive grid of metric cards on a dark background:
- **CPU Card** — overall usage % with per-core bars and a live sparkline graph, color-coded green/yellow/red
- **Temperature Card** — CPU temp in °C with a live chart and threshold coloring
- **RAM Card** — used/total memory with a usage sparkline
- **Swap Card** — swap usage percentage
- **Disk Card** — per-filesystem usage bars
- **Network Card** — per-interface RX/TX speeds with a live chart
- **System Info Card** — hostname, OS, kernel, uptime, load averages, process count

## Requirements

- Node.js 18+
- Raspberry Pi (or any Linux system — some metrics use `/sys/class/thermal` and `vcgencmd`)

## Install

```bash
# From the project root:
npm install                     # installs root dev deps (concurrently)
npm run install:all             # installs backend + frontend deps
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run (Development)

```bash
# From project root — starts both backend (port 3001) and frontend dev server (port 5173)
npm run dev
```

Then open http://localhost:5173 in your browser. The frontend proxies `/api` and `/ws` to the backend.

## Run (Production)

```bash
# Build the frontend
npm run build

# Start the backend (serves the built frontend + API + WebSocket on port 3001)
npm start
```

Open http://localhost:3001

## Systemd Service (run on boot)

Create `/etc/systemd/system/pi-dashboard.service`:

```ini
[Unit]
Description=Pi Dashboard
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pi-dashboard
ExecStart=/usr/bin/node backend/src/index.js
Restart=on-failure
RestartSec=5
Environment=PORT=3001
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pi-dashboard
sudo systemctl start pi-dashboard
sudo systemctl status pi-dashboard
```

## Configuration

Set `PORT` environment variable to change the port (default: `3001`).

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, ws (WebSocket), systeminformation
