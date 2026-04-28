import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SparkPoint } from '../types/metrics';

interface SparklineProps {
  data: SparkPoint[];
  color: string;
  height?: number;
  domain?: [number, number];
}

export function Sparkline({ data, color, height = 48, domain }: SparklineProps) {
  if (data.length < 2) {
    return <div style={{ height }} className="opacity-20 bg-slate-800 rounded" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <YAxis domain={domain ?? ['auto', 'auto']} hide />
        <Area
          type="monotoneX"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
