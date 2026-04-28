import React from 'react';
import { HardDrive, AlertCircle } from 'lucide-react';
import { Card, UsageBar } from './Card';
import { DriveInfo } from '../types/metrics';
import { formatBytes, getThresholdColor } from '../utils/format';

interface DrivesCardProps {
  drives: DriveInfo[];
}

export function DrivesCard({ drives }: DrivesCardProps) {
  if (!drives || drives.length === 0) {
    return (
      <Card title="Storage Devices" icon={<HardDrive size={14} />}>
        <span className="text-slate-500 text-sm">No physical drives detected</span>
      </Card>
    );
  }

  return (
    <Card title="Storage Devices" icon={<HardDrive size={14} />}>
      <div className="space-y-4">
        {drives.map((d) => {
          const label = d.name || d.device;
          const subLabel = [d.vendor, d.interfaceType, d.type]
            .filter(Boolean)
            .join(' • ');
          return (
            <div key={d.device} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-1">
                <div className="min-w-0">
                  <div className="text-sm text-slate-200 font-medium truncate" title={label}>
                    {label}
                  </div>
                  {subLabel && (
                    <div className="text-[10px] text-slate-500 truncate" title={subLabel}>
                      {subLabel}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono shrink-0 ml-2">
                  {formatBytes(d.size)}
                </div>
              </div>

              {d.mounted ? (
                <>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-mono truncate max-w-[160px]" title={d.mounts.join(', ')}>
                      {d.mounts.join(', ')}
                    </span>
                    <span>
                      {formatBytes(d.usedBytes)} used ({d.usedPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <UsageBar percent={d.usedPercent} color={getThresholdColor(d.usedPercent)} />
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1">
                  <AlertCircle size={12} />
                  <span>
                    Not mounted{d.partitions === 0 ? ' (no partitions / unformatted)' : ''}
                  </span>
                </div>
              )}

              {d.temperature !== null && d.temperature !== undefined && (
                <div className="text-[10px] text-slate-500 mt-1">
                  Temp: {d.temperature}°C
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
