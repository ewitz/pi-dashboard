import React from 'react';
import { Cpu } from 'lucide-react';
import { Card, UsageBar } from './Card';
import { Sparkline } from './Sparkline';
import { CpuMetrics } from '../types/metrics';
import { SparkPoint } from '../types/metrics';
import { getThresholdColor, getThresholdClass } from '../utils/format';

interface CpuCardProps {
  cpu: CpuMetrics;
  history: SparkPoint[];
}

export function CpuCard({ cpu, history }: CpuCardProps) {
  const color = getThresholdColor(cpu.usage);

  return (
    <Card title="CPU" icon={<Cpu size={14} />}>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold tabular-nums ${getThresholdClass(cpu.usage)}`}>
          {cpu.usage.toFixed(1)}<span className="text-lg font-normal text-slate-500">%</span>
        </span>
        <span className="text-slate-400 text-sm">{cpu.speed.toFixed(0)} MHz</span>
      </div>

      <Sparkline data={history} color={color} domain={[0, 100]} />

      {cpu.cores.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mt-1">
          {cpu.cores.map((load, i) => (
            <UsageBar
              key={i}
              percent={load}
              color={getThresholdColor(load)}
              label={`Core ${i}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
