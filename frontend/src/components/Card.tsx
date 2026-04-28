import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, icon, children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-slate-700 ${className}`}
    >
      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
        <span className="text-slate-500">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

interface UsageBarProps {
  percent: number;
  color: string;
  label?: string;
}

export function UsageBar({ percent, color, label }: UsageBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{label}</span>
          <span>{percent.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
