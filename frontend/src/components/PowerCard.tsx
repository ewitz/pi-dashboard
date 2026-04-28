import React from 'react';
import { Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from './Card';
import { PowerInfo } from '../types/metrics';

interface PowerCardProps {
  power?: PowerInfo;
}

const SUMMARY_STYLES: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  ok:           { color: 'text-emerald-400', icon: <CheckCircle2 size={14} />, label: 'Power OK' },
  undervoltage: { color: 'text-red-400',     icon: <AlertTriangle size={14} />, label: 'UNDER-VOLTAGE NOW' },
  throttling:   { color: 'text-amber-400',   icon: <AlertTriangle size={14} />, label: 'Throttling now' },
  'past-event': { color: 'text-amber-400/80', icon: <Clock size={14} />,        label: 'Past throttle event' },
  unknown:      { color: 'text-slate-400',   icon: <Clock size={14} />,         label: 'Unknown' },
};

const PRIMARY_RAILS = ['EXT5V', '3V3_SYS', 'VDD_CORE', '1V8_SYS', 'BATT'];

export function PowerCard({ power }: PowerCardProps) {
  if (!power || !power.available) {
    return (
      <Card title="Power" icon={<Zap size={14} />}>
        <span className="text-slate-500 text-sm">vcgencmd not available</span>
      </Card>
    );
  }

  const style = SUMMARY_STYLES[power.summary] ?? SUMMARY_STYLES.unknown;

  // Show primary rails first, then any others, capped to keep card tidy
  const sortedRails = [...power.rails].sort((a, b) => {
    const ai = PRIMARY_RAILS.indexOf(a.name);
    const bi = PRIMARY_RAILS.indexOf(b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <Card title="Power" icon={<Zap size={14} />}>
      <div className="space-y-3">
        <div className={`flex items-center gap-1.5 text-sm font-medium ${style.color}`}>
          {style.icon}
          <span>{style.label}</span>
          {power.throttledRaw && (
            <span className="text-[10px] text-slate-500 font-mono ml-auto">
              throttled={power.throttledRaw}
            </span>
          )}
        </div>

        {(power.summary === 'undervoltage' || power.summary === 'throttling') && (
          <div className="text-xs text-amber-300 bg-amber-900/20 border border-amber-700/30 rounded p-2">
            {power.flags.underVoltageNow && <div>⚠ Under-voltage detected — check PSU/cable</div>}
            {power.flags.throttledNow && <div>⚠ CPU is being throttled right now</div>}
            {power.flags.freqCappedNow && <div>⚠ Frequency capped</div>}
            {power.flags.softTempLimitNow && <div>⚠ Soft temperature limit hit</div>}
          </div>
        )}

        {power.summary === 'past-event' && (
          <div className="text-[11px] text-amber-300/80 bg-amber-900/10 border border-amber-700/20 rounded p-2">
            Recovered from a power/throttle event since last boot:
            <ul className="mt-1 ml-3 list-disc">
              {power.flags.underVoltageOccurred && <li>Under-voltage</li>}
              {power.flags.throttledOccurred && <li>CPU throttling</li>}
              {power.flags.freqCappedOccurred && <li>Frequency capped</li>}
              {power.flags.softTempLimitOccurred && <li>Soft temp limit</li>}
            </ul>
          </div>
        )}

        {power.totalWatts !== undefined && power.totalWatts > 0 && (
          <div className="flex justify-between items-baseline border-t border-slate-800 pt-2">
            <span className="text-xs text-slate-400">Total draw</span>
            <span className="text-lg font-mono text-slate-100">
              {power.totalWatts.toFixed(2)}<span className="text-xs text-slate-500 ml-1">W</span>
            </span>
          </div>
        )}

        {sortedRails.length > 0 && (
          <div className="space-y-1 text-[11px] font-mono">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-slate-500 border-b border-slate-800 pb-1">
              <span>Rail</span>
              <span className="text-right">Volts</span>
              <span className="text-right">Watts</span>
            </div>
            {sortedRails.map(r => (
              <div key={r.name} className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-slate-300">
                <span className="truncate" title={r.name}>{r.name}</span>
                <span className="text-right">{r.volts.toFixed(2)}V</span>
                <span className="text-right text-slate-400">
                  {r.watts != null ? r.watts.toFixed(2) + 'W' : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
