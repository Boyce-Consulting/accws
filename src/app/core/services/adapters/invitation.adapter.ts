import { toStringId } from './envelope';

export type InvitationRole = 'owner' | 'admin' | 'member';

export interface OrgInvitationDto {
  id: number | string;
  organization_id: number | string;
  email?: string | null;
  phone?: string | null;
  target?: string;
  role: InvitationRole;
  grants_admin?: boolean;
  token?: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at?: string;
  status?: 'pending' | 'accepted' | 'expired';
  organization?: { id: number | string; name: string; slug?: string };
}

export interface OrgInvitation {
  id: string;
  organizationId: string;
  email: string | null;
  phone: string | null;
  target: string;
  role: InvitationRole;
  grantsAdmin: boolean;
  token?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt?: string;
  status?: 'pending' | 'accepted' | 'expired';
  organizationName?: string;
}

export function mapOrgInvitationFromDto(dto: OrgInvitationDto): OrgInvitation {
  const email = dto.email ?? null;
  const phone = dto.phone ?? null;
  const target = dto.target ?? email ?? phone ?? '';
  return {
    id: toStringId(dto.id),
    organizationId: toStringId(dto.organization_id),
    email,
    phone,
    target,
    role: dto.role,
    grantsAdmin: dto.grants_admin ?? false,
    token: dto.token,
    expiresAt: dto.expires_at,
    acceptedAt: dto.accepted_at ?? null,
    createdAt: dto.created_at,
    status: dto.status,
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
  email: string | null;
  phone: string | null;
  target: string; // display-safe (email or masked phone)
  role: InvitationRole | 'application-admin';
  expires_at: string;
  grants_admin: boolean;
  account_exists: boolean;
  organization?: { id: number | string; name: string; slug?: string } | null;
}

export interface InvitationPreview {
  email: string | null;
  phone: string | null;
  target: string;
  role: InvitationRole | 'application-admin';
  expiresAt: string;
  grantsAdmin: boolean;
  accountExists: boolean;
  organizationId?: string;
  organizationName?: string;
}

export function mapInvitationPreviewFromDto(dto: InvitationPreviewDto): InvitationPreview {
  return {
    email: dto.email,
    phone: dto.phone,
    target: dto.target,
    role: dto.role,
    expiresAt: dto.expires_at,
    grantsAdmin: dto.grants_admin,
    accountExists: dto.account_exists,
    organizationId: dto.organization ? toStringId(dto.organization.id) : undefined,
    organizationName: dto.organization?.name,
  };
}
