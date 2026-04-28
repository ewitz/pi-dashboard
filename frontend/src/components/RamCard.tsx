import React from 'react';
import { MemoryStick } from 'lucide-react';
import { Card, UsageBar } from './Card';
import { Sparkline } from './Sparkline';
import { MemoryMetrics, SparkPoint } from '../types/metrics';
import { formatBytes, getThresholdColor, getThresholdClass } from '../utils/format';

interface RamCardProps {
  memory: MemoryMetrics;
  history: SparkPoint[];
}

export function RamCard({ memory, history }: RamCardProps) {
  const color = getThresholdColor(memory.percent);

  return (
    <Card title="Memory" icon={<MemoryStick size={14} />}>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold tabular-nums ${getThresholdClass(memory.percent)}`}>
          {memory.percent.toFixed(1)}<span className="text-lg font-normal text-slate-500">%</span>
        </span>
        <span className="text-slate-400 text-sm">
          {formatBytes(memory.used)} / {formatBytes(memory.total)}
        </span>
      </div>

      <Sparkline data={history} color={color} domain={[0, 100]} />

      <div className="space-y-1 mt-1">
        <UsageBar percent={memory.percent} color={color} label="RAM" />
        {memory.swapTotal > 0 && (
          <UsageBar
            percent={memory.swapPercent}
            color={getThresholdColor(memory.swapPercent)}
            label={`Swap (${formatBytes(memory.swapTotal)})`}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-slate-600">
        <span>Free: {formatBytes(memory.available)}</span>
        <span>Used: {formatBytes(memory.used)}</span>
      </div>
    </Card>
  );
}
