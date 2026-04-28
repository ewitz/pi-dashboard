export interface CpuMetrics {
  usage: number;
  cores: number[];
  speed: number;
  temperature: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  available: number;
  percent: number;
  swapTotal: number;
  swapUsed: number;
  swapPercent: number;
}

export interface DiskMetric {
  fs: string;
  mount: string;
  size: number;
  used: number;
  available: number;
  percent: number;
}

export interface DriveInfo {
  device: string;
  name: string;
  vendor: string;
  type: string;
  interfaceType: string;
  size: number;
  serial: string;
  temperature: number | null;
  smartStatus: string;
  partitions: number;
  mounts: string[];
  mounted: boolean;
  usedBytes: number;
  usedPercent: number;
}

export interface NetworkInterface {
  iface: string;
  rx: number;
  tx: number;
  rxSec: number;
  txSec: number;
}

export interface SystemInfo {
  uptime: number;
  loadAvg: [number, number, number];
  hostname: string;
  os: string;
  kernel: string;
  processes: number;
}

export interface SystemMetrics {
  timestamp: number;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetric[];
  drives?: DriveInfo[];
  network: NetworkInterface[];
  system: SystemInfo;
}

export type SparkPoint = { t: number; v: number };
