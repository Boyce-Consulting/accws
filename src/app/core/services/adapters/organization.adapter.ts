import { Organization } from '../../models/organization.model';
import { toStringId } from './envelope';

export interface OrganizationDto {
  id: number | string;
  name: string;
  slug?: string;
  type?: Organization['type'];
  status?: Organization['status'];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  province?: string;
  notes?: string;
  created_at?: string;
}

export function mapOrganizationFromDto(dto: OrganizationDto): Organization {
  return {
    id: toStringId(dto.id),
    name: dto.name,
    slug: dto.slug,
    type: dto.type,
    status: dto.status,
    contactName: dto.contact_name,
    contactEmail: dto.contact_email,
    contactPhone: dto.contact_phone,
    address: dto.address,
    province: dto.province,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}
