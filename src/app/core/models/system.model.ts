export type SystemType = 'lagoon' | 'lift-station' | 'wwtp';
export type SystemStatus = 'healthy' | 'attention' | 'critical' | 'offline';

export interface WastewaterSystem {
  id: string;
  clientId: string;
  name: string;
  type: SystemType;
  status: SystemStatus;
  location: { lat: number; lng: number };
  province: string;
  commissioned?: number;
  population?: number;
  flowRate?: number; // m3/day
  cells: Cell[];
  description?: string;
}

export interface Cell {
  id: string;
  name: string;
  areaAcres: number;
  areaM2: number;
  volumeM3: number;
  function: 'anaerobic' | 'facultative' | 'storage' | 'evaporative' | 'treatment';
  retentionTimeDays?: number;
  adjustedRetentionDays?: number;
  sludgeVolumeM3?: number;
  depth?: number;
}
