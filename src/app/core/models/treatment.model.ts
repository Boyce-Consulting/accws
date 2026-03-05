export type TreatmentStatus = 'active' | 'planned' | 'completed' | 'draft';

export interface DosingSchedule {
  id: string;
  zone: string;
  productId: string;
  productName: string;
  quantityLbs: number;
  frequency: string; // e.g., 'weekly', 'monthly', 'daily Mon-Fri'
  months: number[];  // 1-12
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  systemId: string;
  clientId: string;
  year: number;
  status: TreatmentStatus;
  dosingSchedules: DosingSchedule[];
  totalCost?: number;
  createdAt: string;
  updatedAt?: string;
}
