import React from 'react';
import { HardDrive } from 'lucide-react';
import { Card, UsageBar } from './Card';
import { DiskMetric } from '../types/metrics';
import { formatBytes, getThresholdColor } from '../utils/format';

interface DiskCardProps {
  disks: DiskMetric[];
}

export function DiskCard({ disks }: DiskCardProps) {
  if (disks.length === 0) {
    return (
      <Card title="Disk" icon={<HardDrive size={14} />}>
        <span className="text-slate-500 text-sm">No filesystems</span>
      </Card>
    );
  }

  return (
    <Card title="Disk" icon={<HardDrive size={14} />}>
      <div className="space-y-3">
        {disks.map((disk) => (
          <div key={disk.mount}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono truncate max-w-[120px]" title={disk.mount}>
                {disk.mount}
              </span>
              <span className="text-slate-500">
                {formatBytes(disk.used)} / {formatBytes(disk.size)}
              </span>
            </div>
            <UsageBar percent={disk.percent} color={getThresholdColor(disk.percent)} />
          </div>
        ))}
      </div>
    </Card>
  );
}
