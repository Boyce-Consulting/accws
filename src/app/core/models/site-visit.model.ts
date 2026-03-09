export type VisitActivityType =
  | 'product-application'
  | 'flow-meter-reading'
  | 'complaint'
  | 'jet-truck'
  | 'hydrovac'
  | 'aeration-maintenance'
  | 'grass-mowing'
  | 'sludge-survey'
  | 'dredging'
  | 'sampling'
  | 'other';

export interface VisitActivity {
  type: VisitActivityType;
  description?: string;
}

export interface ProductApplication {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  method: string;
  zone?: string;
  notes?: string;
}

export type OdourNature =
  | 'hydrogen-sulfide'
  | 'earthy'
  | 'ammonia'
  | 'methane'
  | 'sewer'
  | 'other'
  | 'none';

export interface OdourObservation {
  intensity: number; // 1-5 scale
  nature: OdourNature[];
}

export type FOGAppearance = 'globules' | 'matts' | 'sticking-to-wall' | 'clear';
export type WaterColour = 'blue' | 'green' | 'black' | 'light-brown' | 'dark-brown' | 'red' | 'pink';
export type AlgaeType = 'duckweed' | 'bright-green' | 'dark-green' | 'brown' | 'pond-weed';
export type CattailSeverity = 'none' | 'light' | 'moderate' | 'severe';

export interface LiftStationObservation {
  systemType: 'lift-station';
  fogPresent: boolean;
  fogAppearance?: FOGAppearance[];
  fogSurfaceCoveragePct?: number;
  odour?: OdourObservation;
  flowMeterReading?: number;
  h2sReading?: number;
  productApplications: ProductApplication[];
}

export interface LagoonObservation {
  systemType: 'lagoon';
  sludgePresent: boolean;
  sludgeAppearance?: string[];
  sludgeSurfaceCoveragePct?: number;
  waterColour?: WaterColour[];
  algaePresent: boolean;
  algaeType?: AlgaeType[];
  cattailSeverity: CattailSeverity;
  odour?: OdourObservation;
  productApplications: ProductApplication[];
}

export interface WWTPObservation {
  systemType: 'wwtp';
  odour?: OdourObservation;
  effluentClarity: 'clear' | 'slightly-turbid' | 'turbid' | 'opaque';
  productApplications: ProductApplication[];
}

export type SystemObservation = LiftStationObservation | LagoonObservation | WWTPObservation;

export type VisitStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface SiteVisit {
  id: string;
  systemId: string;
  clientId: string;
  treatmentPlanId?: string;
  visitDate: string;
  visitedBy: string;
  status: VisitStatus;
  activities: VisitActivity[];
  observation: SystemObservation;
  weather?: import('./weather.model').WeatherSnapshot;
  photoIds: string[];
  notes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  nextVisitDate?: string;
  createdAt: string;
  updatedAt?: string;
}
