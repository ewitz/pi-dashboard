import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemMetrics, SparkPoint } from '../types/metrics';

const MAX_HISTORY = 60;

export interface MetricsHistory {
  latest: SystemMetrics | null;
  cpuHistory: SparkPoint[];
  tempHistory: SparkPoint[];
  ramHistory: SparkPoint[];
  netRxHistory: SparkPoint[];
  netTxHistory: SparkPoint[];
  connected: boolean;
}

function appendHistory(arr: SparkPoint[], point: SparkPoint): SparkPoint[] {
  const next = [...arr, point];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

export function useMetrics(): MetricsHistory {
  const [state, setState] = useState<MetricsHistory>({
    latest: null,
    cpuHistory: [],
    tempHistory: [],
    ramHistory: [],
    netRxHistory: [],
    netTxHistory: [],
    connected: false,
  });

  const historyRef = useRef<Omit<MetricsHistory, 'latest' | 'connected'>>({
    cpuHistory: [],
    tempHistory: [],
    ramHistory: [],
    netRxHistory: [],
    netTxHistory: [],
  });

  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setState(s => ({ ...s, connected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const metrics: SystemMetrics = JSON.parse(event.data);
        const t = metrics.timestamp;
        const h = historyRef.current;

        h.cpuHistory = appendHistory(h.cpuHistory, { t, v: metrics.cpu.usage });
        h.tempHistory = appendHistory(h.tempHistory, { t, v: metrics.cpu.temperature });
        h.ramHistory = appendHistory(h.ramHistory, { t, v: metrics.memory.percent });

        const totalRx = metrics.network.reduce((s, n) => s + n.rxSec, 0);
        const totalTx = metrics.network.reduce((s, n) => s + n.txSec, 0);
        h.netRxHistory = appendHistory(h.netRxHistory, { t, v: totalRx });
        h.netTxHistory = appendHistory(h.netTxHistory, { t, v: totalTx });

        setState({
          latest: metrics,
          cpuHistory: [...h.cpuHistory],
          tempHistory: [...h.tempHistory],
          ramHistory: [...h.ramHistory],
          netRxHistory: [...h.netRxHistory],
          netTxHistory: [...h.netTxHistory],
          connected: true,
        });
      } catch (_) {}
    };

    ws.onclose = () => {
      setState(s => ({ ...s, connected: false }));
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}
