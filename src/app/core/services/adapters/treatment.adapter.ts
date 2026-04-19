import { DosingSchedule, TreatmentPlan } from '../../models/treatment.model';
import { fromCents, toStringId } from './envelope';

interface ProductRef {
  id: number | string;
  name: string;
}

interface DosingScheduleDto {
  id: number | string;
  zone: string;
  product_id: number | string;
  product_name?: string;
  product?: ProductRef;
  quantity_lbs: number;
  frequency: string;
  months: number[];
  notes?: string;
}

export interface TreatmentPlanDto {
  id: number | string;
  wastewater_system_id: number | string;
  organization_id: number | string;
  year: number;
  status: TreatmentPlan['status'];
  total_cost_cents?: number;
  dosing_schedules?: DosingScheduleDto[];
  created_at: string;
  updated_at?: string;
}

function mapDosing(dto: DosingScheduleDto): DosingSchedule {
  return {
    id: toStringId(dto.id),
    zone: dto.zone,
    productId: toStringId(dto.product_id),
    productName: dto.product_name ?? dto.product?.name ?? '',
    quantityLbs: dto.quantity_lbs,
    frequency: dto.frequency,
    months: dto.months,
    notes: dto.notes,
  };
}

export function mapTreatmentFromDto(dto: TreatmentPlanDto): TreatmentPlan {
  return {
    id: toStringId(dto.id),
    systemId: toStringId(dto.wastewater_system_id),
    clientId: toStringId(dto.organization_id),
    year: dto.year,
    status: dto.status,
    dosingSchedules: (dto.dosing_schedules ?? []).map(mapDosing),
    totalCost: fromCents(dto.total_cost_cents),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export interface UpcomingTaskDto {
  treatment_plan_id: number | string;
  system_id: number | string;
  system_name: string;
  zone: string;
  product_id: number | string;
  product_name: string;
  quantity_lbs: number;
  frequency: string;
}

export interface UpcomingTask {
  treatmentPlanId: string;
  systemId: string;
  systemName: string;
  zone: string;
  productId: string;
  productName: string;
  quantityLbs: number;
  frequency: string;
}

export function mapUpcomingFromDto(dto: UpcomingTaskDto): UpcomingTask {
  return {
    treatmentPlanId: toStringId(dto.treatment_plan_id),
    systemId: toStringId(dto.system_id),
    systemName: dto.system_name,
    zone: dto.zone,
    productId: toStringId(dto.product_id),
    productName: dto.product_name,
    quantityLbs: dto.quantity_lbs,
    frequency: dto.frequency,
  };
}
