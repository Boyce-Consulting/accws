import { toStringId } from './envelope';

export type InvitationRole = 'owner' | 'admin' | 'member';

export interface OrgInvitationDto {
  id: number | string;
  organization_id: number | string;
  email: string;
  role: InvitationRole;
  grants_admin?: boolean;
  token?: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at?: string;
  organization?: { id: number | string; name: string; slug?: string };
}

export interface OrgInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: InvitationRole;
  grantsAdmin: boolean;
  token?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt?: string;
  organizationName?: string;
}

export function mapOrgInvitationFromDto(dto: OrgInvitationDto): OrgInvitation {
  return {
    id: toStringId(dto.id),
    organizationId: toStringId(dto.organization_id),
    email: dto.email,
    role: dto.role,
    grantsAdmin: dto.grants_admin ?? false,
    token: dto.token,
    expiresAt: dto.expires_at,
    acceptedAt: dto.accepted_at ?? null,
    createdAt: dto.created_at,
    organizationName: dto.organization?.name,
  };
}

export interface AdminInvitationDto {
  id: number | string;
  email: string;
  token?: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at?: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  token?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt?: string;
}

export function mapAdminInvitationFromDto(dto: AdminInvitationDto): AdminInvitation {
  return {
    id: toStringId(dto.id),
    email: dto.email,
    token: dto.token,
    expiresAt: dto.expires_at,
    acceptedAt: dto.accepted_at ?? null,
    createdAt: dto.created_at,
  };
}

export interface InvitationPreviewDto {
  email: string;
  role: InvitationRole;
  expires_at: string;
  organization?: { id: number | string; name: string; slug?: string } | null;
}

export interface InvitationPreview {
  email: string;
  role: InvitationRole;
  expiresAt: string;
  organizationId?: string;
  organizationName?: string;
  /** null means it's a system-admin invite (no org). */
  isSystemAdmin: boolean;
}

export function mapInvitationPreviewFromDto(dto: InvitationPreviewDto): InvitationPreview {
  return {
    email: dto.email,
    role: dto.role,
    expiresAt: dto.expires_at,
    organizationId: dto.organization ? toStringId(dto.organization.id) : undefined,
    organizationName: dto.organization?.name,
    isSystemAdmin: !dto.organization,
  };
}
