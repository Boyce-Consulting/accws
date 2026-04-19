import {
  ProductApplication,
  SiteVisit,
  SystemObservation,
  VisitActivity,
} from '../../models/site-visit.model';
import { WeatherSnapshot } from '../../models/weather.model';
import { toStringId } from './envelope';

interface ActivityDto {
  type: VisitActivity['type'];
  description?: string;
}

interface ProductApplicationDto {
  product_id?: number | string;
  product_name?: string;
  product?: { id: number | string; name: string };
  quantity: number;
  unit: string;
  method?: string;
  zone?: string;
  notes?: string;
}

interface PhotoDto {
  id: number | string;
}

export interface SiteVisitDto {
  id: number | string;
  wastewater_system_id: number | string;
  organization_id: number | string;
  treatment_plan_id?: number | string | null;
  visit_date: string;
  visited_by?: string;
  status: SiteVisit['status'];
  activities?: ActivityDto[];
  observation?: SystemObservation | null;
  weather?: WeatherSnapshot | null;
  product_applications?: ProductApplicationDto[];
  photos?: PhotoDto[];
  notes?: string;
  follow_up_required?: boolean;
  follow_up_notes?: string;
  next_visit_date?: string;
  created_at: string;
  updated_at?: string;
}

function mapApplication(dto: ProductApplicationDto): ProductApplication {
  return {
    productId: toStringId(dto.product_id ?? dto.product?.id ?? ''),
    productName: dto.product_name ?? dto.product?.name ?? '',
    quantity: dto.quantity,
    unit: dto.unit,
    method: dto.method ?? '',
    zone: dto.zone,
    notes: dto.notes,
  };
}

export function mapSiteVisitFromDto(dto: SiteVisitDto): SiteVisit {
  const observation =
    dto.observation ??
    ({
      systemType: 'lagoon',
      sludgePresent: false,
      algaePresent: false,
      cattailSeverity: 'none',
      productApplications: (dto.product_applications ?? []).map(mapApplication),
    } as SystemObservation);

  // If the visit payload already embeds productApplications on the observation,
  // keep them. Otherwise fill from the flat product_applications array.
  if ('productApplications' in observation && !observation.productApplications?.length) {
    (observation as { productApplications: ProductApplication[] }).productApplications =
      (dto.product_applications ?? []).map(mapApplication);
  }

  return {
    id: toStringId(dto.id),
    systemId: toStringId(dto.wastewater_system_id),
    clientId: toStringId(dto.organization_id),
    treatmentPlanId: dto.treatment_plan_id != null ? toStringId(dto.treatment_plan_id) : undefined,
    visitDate: dto.visit_date,
    visitedBy: dto.visited_by ?? '',
    status: dto.status,
    activities: dto.activities ?? [],
    observation,
    weather: dto.weather ?? undefined,
    photoIds: (dto.photos ?? []).map((p) => toStringId(p.id)),
    notes: dto.notes,
    followUpRequired: dto.follow_up_required ?? false,
    followUpNotes: dto.follow_up_notes,
    nextVisitDate: dto.next_visit_date,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
