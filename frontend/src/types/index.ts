export interface SiloLevelSample {
  timestamp: Date;
  level: number; // 0-100%
  volumeKg?: number;
}

export interface AlarmEvent {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
}

export type SiloStatus = 'normal' | 'low' | 'critical';

export interface SiloData {
  currentLevel: number;
  status: SiloStatus;
  volumeKg: number;
  lastRefillTime: Date;
  lastUpdateTime: Date;
}

export type MachineState = 'running' | 'stopped' | 'setup';

export interface ProductionData {
  machineState: MachineState;
  productionRate: number; // pieces per hour
}

export type ConnectionStatus = 'connected' | 'offline' | 'reconnecting';
