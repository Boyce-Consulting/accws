import { toStringId } from './envelope';

export interface DashboardSummaryDto {
  systems_total: number;
  systems_by_status: Record<string, number>;
  treatment_plans_active: number;
  visits_last_30_days: number;
  samples_last_30_days: number;
  follow_ups_open: number;
}

export interface DashboardSummary {
  systemsTotal: number;
  systemsByStatus: Record<string, number>;
  treatmentPlansActive: number;
  visitsLast30Days: number;
  samplesLast30Days: number;
  followUpsOpen: number;
}

export function mapDashboardFromDto(dto: DashboardSummaryDto): DashboardSummary {
  return {
    systemsTotal: dto.systems_total,
    systemsByStatus: dto.systems_by_status ?? {},
    treatmentPlansActive: dto.treatment_plans_active,
    visitsLast30Days: dto.visits_last_30_days,
    samplesLast30Days: dto.samples_last_30_days,
    followUpsOpen: dto.follow_ups_open,
  };
}

export interface ActivityItemDto {
  id: number | string;
  kind: string;
  timestamp: string;
  title: string;
  detail?: string;
  system_id?: number | string;
  system_name?: string;
  status?: string;
}

export interface ActivityItem {
  id: string;
  kind: string;
  timestamp: string;
  title: string;
  detail?: string;
  systemId?: string;
  systemName?: string;
  status?: string;
}

export function mapActivityFromDto(dto: ActivityItemDto): ActivityItem {
  return {
    id: toStringId(dto.id),
    kind: dto.kind,
    timestamp: dto.timestamp,
    title: dto.title,
    detail: dto.detail,
    systemId: dto.system_id != null ? toStringId(dto.system_id) : undefined,
    systemName: dto.system_name,
    status: dto.status,
  };
}

export interface AlertItemDto {
  id: number | string;
  level: 'warning' | 'critical';
  title: string;
  detail?: string;
  system_id?: number | string;
  due_date?: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  level: 'warning' | 'critical';
  title: string;
  detail?: string;
  systemId?: string;
  dueDate?: string;
  timestamp: string;
}

export function mapAlertFromDto(dto: AlertItemDto): AlertItem {
  return {
    id: toStringId(dto.id),
    level: dto.level,
    title: dto.title,
    detail: dto.detail,
    systemId: dto.system_id != null ? toStringId(dto.system_id) : undefined,
    dueDate: dto.due_date,
    timestamp: dto.timestamp,
  };
}
