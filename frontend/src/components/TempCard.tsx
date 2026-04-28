import React from 'react';
import { Thermometer } from 'lucide-react';
import { Card } from './Card';
import { Sparkline } from './Sparkline';
import { SparkPoint } from '../types/metrics';
import { getTempColor, getTempClass } from '../utils/format';

interface TempCardProps {
  temperature: number;
  history: SparkPoint[];
}

export function TempCard({ temperature, history }: TempCardProps) {
  const color = getTempColor(temperature);

  return (
    <Card title="Temperature" icon={<Thermometer size={14} />}>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold tabular-nums ${getTempClass(temperature)}`}>
          {temperature > 0 ? temperature.toFixed(1) : '--'}
          <span className="text-lg font-normal text-slate-500">°C</span>
        </span>
        <span className="text-slate-500 text-xs">
          {temperature >= 80 ? 'HOT' : temperature >= 65 ? 'WARM' : 'COOL'}
        </span>
      </div>

      <Sparkline data={history} color={color} domain={[0, 100]} />

      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>0°C</span>
        <span className="text-green-700">65°</span>
        <span className="text-amber-700">80°</span>
        <span className="text-red-700">100°C</span>
      </div>
    </Card>
  );
}
