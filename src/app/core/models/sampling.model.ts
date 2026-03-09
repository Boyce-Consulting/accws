export interface EffluentParameters {
  bod?: number;      // mg/L
  tss?: number;      // mg/L
  ammonia?: number;   // mg/L
  phosphorus?: number;// mg/L
  cod?: number;       // mg/L
  ph?: number;
  dissolvedOxygen?: number; // mg/L
  h2s?: number;       // ppm
}

export interface SludgeSurvey {
  cellId: string;
  cellName: string;
  year: number;
  volumeM3: number;
  totalSolidsPct?: number;
  volatileSolidsPct?: number;
  specificGravity?: number;
}

export interface SampleRecord {
  id: string;
  systemId: string;
  cellId?: string;
  date: string;
  type: 'effluent' | 'sludge' | 'influent';
  parameters: EffluentParameters;
  sludgeSurvey?: SludgeSurvey;
  notes?: string;
  collectedBy?: string;
  siteVisitId?: string;
}
