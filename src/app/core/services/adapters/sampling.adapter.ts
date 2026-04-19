import { EffluentParameters, SampleRecord, SludgeSurvey } from '../../models/sampling.model';
import { toStringId } from './envelope';

interface SludgeSurveyDto {
  cell_id?: number | string;
  cell_name?: string;
  year?: number;
  volume_m3?: number;
  total_solids_pct?: number;
  volatile_solids_pct?: number;
  specific_gravity?: number;
}

interface ParametersDto {
  bod?: number;
  tss?: number;
  ammonia?: number;
  phosphorus?: number;
  cod?: number;
  ph?: number;
  dissolved_oxygen?: number;
  h2s?: number;
}

export interface SampleDto {
  id: number | string;
  wastewater_system_id: number | string;
  cell_id?: number | string | null;
  sample_date: string;
  type: SampleRecord['type'];
  parameters?: ParametersDto;
  sludge_survey?: SludgeSurveyDto | null;
  notes?: string;
  collected_by?: string;
  site_visit_id?: number | string | null;
}

function mapParams(dto?: ParametersDto): EffluentParameters {
  if (!dto) return {};
  return {
    bod: dto.bod,
    tss: dto.tss,
    ammonia: dto.ammonia,
    phosphorus: dto.phosphorus,
    cod: dto.cod,
    ph: dto.ph,
    dissolvedOxygen: dto.dissolved_oxygen,
    h2s: dto.h2s,
  };
}

function mapSludge(dto: SludgeSurveyDto): SludgeSurvey {
  return {
    cellId: dto.cell_id != null ? toStringId(dto.cell_id) : '',
    cellName: dto.cell_name ?? '',
    year: dto.year ?? 0,
    volumeM3: dto.volume_m3 ?? 0,
    totalSolidsPct: dto.total_solids_pct,
    volatileSolidsPct: dto.volatile_solids_pct,
    specificGravity: dto.specific_gravity,
  };
}

export function mapSampleFromDto(dto: SampleDto): SampleRecord {
  return {
    id: toStringId(dto.id),
    systemId: toStringId(dto.wastewater_system_id),
    cellId: dto.cell_id != null ? toStringId(dto.cell_id) : undefined,
    date: dto.sample_date,
    type: dto.type,
    parameters: mapParams(dto.parameters),
    sludgeSurvey: dto.sludge_survey ? mapSludge(dto.sludge_survey) : undefined,
    notes: dto.notes,
    collectedBy: dto.collected_by,
    siteVisitId: dto.site_visit_id != null ? toStringId(dto.site_visit_id) : undefined,
  };
}
