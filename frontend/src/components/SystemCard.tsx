import React from 'react';
import { Server } from 'lucide-react';
import { Card } from './Card';
import { SystemInfo } from '../types/metrics';
import { formatUptime } from '../utils/format';

interface SystemCardProps {
  system: SystemInfo;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="text-slate-300 text-xs font-mono text-right max-w-[60%] truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

export function SystemCard({ system }: SystemCardProps) {
  return (
    <Card title="System" icon={<Server size={14} />}>
      <InfoRow label="Hostname" value={system.hostname} />
      <InfoRow label="OS" value={system.os} />
      <InfoRow label="Kernel" value={system.kernel} />
      <InfoRow label="Uptime" value={formatUptime(system.uptime)} />
      <InfoRow label="Processes" value={String(system.processes)} />
      <InfoRow
        label="Load avg"
        value={system.loadAvg.map(l => l.toFixed(2)).join('  ')}
      />
    </Card>
  );
}
