import { Cell, WastewaterSystem } from '../../models/system.model';
import { toStringId } from './envelope';

interface CellDto {
  id: number | string;
  name: string;
  area_acres?: number;
  area_m2?: number;
  volume_m3?: number;
  function: Cell['function'];
  retention_time_days?: number;
  adjusted_retention_days?: number;
  sludge_volume_m3?: number;
  depth?: number;
}

export interface SystemDto {
  id: number | string;
  organization_id: number | string;
  name: string;
  type: WastewaterSystem['type'];
  status: WastewaterSystem['status'];
  latitude?: number | null;
  longitude?: number | null;
  province?: string;
  commissioned?: number;
  population?: number;
  flow_rate_m3_day?: number;
  description?: string;
  cells?: CellDto[];
}

function mapCell(dto: CellDto): Cell {
  return {
    id: toStringId(dto.id),
    name: dto.name,
    areaAcres: dto.area_acres ?? 0,
    areaM2: dto.area_m2 ?? 0,
    volumeM3: dto.volume_m3 ?? 0,
    function: dto.function,
    retentionTimeDays: dto.retention_time_days,
    adjustedRetentionDays: dto.adjusted_retention_days,
    sludgeVolumeM3: dto.sludge_volume_m3,
    depth: dto.depth,
  };
}

export function mapSystemFromDto(dto: SystemDto): WastewaterSystem {
  return {
    id: toStringId(dto.id),
    clientId: toStringId(dto.organization_id),
    name: dto.name,
    type: dto.type,
    status: dto.status,
    location: { lat: dto.latitude ?? 0, lng: dto.longitude ?? 0 },
    province: dto.province ?? '',
    commissioned: dto.commissioned,
    population: dto.population,
    flowRate: dto.flow_rate_m3_day,
    cells: (dto.cells ?? []).map(mapCell),
    description: dto.description,
  };
}
