import React from 'react';
import { Network } from 'lucide-react';
import { Card } from './Card';
import { Sparkline } from './Sparkline';
import { NetworkInterface, SparkPoint } from '../types/metrics';
import { formatBytes } from '../utils/format';

interface NetworkCardProps {
  interfaces: NetworkInterface[];
  rxHistory: SparkPoint[];
  txHistory: SparkPoint[];
}

function NetStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
      <span className="text-slate-300 text-sm tabular-nums font-mono">
        {formatBytes(value)}/s
      </span>
    </div>
  );
}

export function NetworkCard({ interfaces, rxHistory, txHistory }: NetworkCardProps) {
  const totalRx = interfaces.reduce((s, n) => s + n.rxSec, 0);
  const totalTx = interfaces.reduce((s, n) => s + n.txSec, 0);

  const combined = rxHistory.map((pt, i) => ({
    t: pt.t,
    v: pt.v + (txHistory[i]?.v ?? 0),
  }));

  return (
    <Card title="Network" icon={<Network size={14} />}>
      <div className="flex justify-between">
        <NetStat label="↓ RX" value={totalRx} color="#38bdf8" />
        <NetStat label="↑ TX" value={totalTx} color="#a78bfa" />
      </div>

      <Sparkline data={combined} color="#38bdf8" />

      <div className="space-y-1">
        {interfaces.map((iface) => (
          <div key={iface.iface} className="flex justify-between text-xs text-slate-500">
            <span className="font-mono text-slate-400">{iface.iface}</span>
            <span className="text-sky-500">{formatBytes(iface.rxSec)}/s</span>
            <span className="text-violet-400">{formatBytes(iface.txSec)}/s</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
