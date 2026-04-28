export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export function getThresholdColor(percent: number): string {
  if (percent >= 90) return '#ef4444'; // red-500
  if (percent >= 70) return '#f59e0b'; // amber-500
  return '#22c55e'; // green-500
}

export function getTempColor(temp: number): string {
  if (temp >= 80) return '#ef4444';
  if (temp >= 65) return '#f59e0b';
  return '#22c55e';
}

export function getThresholdClass(percent: number): string {
  if (percent >= 90) return 'text-red-400';
  if (percent >= 70) return 'text-amber-400';
  return 'text-green-400';
}

export function getTempClass(temp: number): string {
  if (temp >= 80) return 'text-red-400';
  if (temp >= 65) return 'text-amber-400';
  return 'text-green-400';
}
