import React from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { useMetrics } from './hooks/useMetrics';
import { CpuCard } from './components/CpuCard';
import { TempCard } from './components/TempCard';
import { RamCard } from './components/RamCard';
import { DiskCard } from './components/DiskCard';
import { DrivesCard } from './components/DrivesCard';
import { NetworkCard } from './components/NetworkCard';
import { SystemCard } from './components/SystemCard';

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
        connected
          ? 'bg-green-950 text-green-400 border border-green-900'
          : 'bg-red-950 text-red-400 border border-red-900'
      }`}
    >
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
      {connected ? 'Live' : 'Reconnecting…'}
    </div>
  );
}

export default function App() {
  const metrics = useMetrics();
  const { latest, connected } = metrics;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0f1e]/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight">Pi Dashboard</h1>
              {latest && (
                <p className="text-xs text-slate-500">{latest.system.hostname}</p>
              )}
            </div>
          </div>
          <ConnectionBadge connected={connected} />
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!latest ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
            <p>Connecting to Pi…</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* CPU — takes up 2 cols on large screens */}
            <div className="sm:col-span-2 lg:col-span-2">
              <CpuCard cpu={latest.cpu} history={metrics.cpuHistory} />
            </div>

            <TempCard temperature={latest.cpu.temperature} history={metrics.tempHistory} />

            <RamCard memory={latest.memory} history={metrics.ramHistory} />

            {latest.network.length > 0 && (
              <div className="sm:col-span-2">
                <NetworkCard
                  interfaces={latest.network}
                  rxHistory={metrics.netRxHistory}
                  txHistory={metrics.netTxHistory}
                />
              </div>
            )}

            <DiskCard disks={latest.disk} />
            <DrivesCard drives={latest.drives ?? []} />

            <SystemCard system={latest.system} />
          </div>
        )}
      </main>

      <footer className="text-center text-slate-700 text-xs py-4">
        Updates every 2 seconds · Pi Dashboard
      </footer>
    </div>
  );
}
