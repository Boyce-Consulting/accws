import { OrganizationMembership } from './organization.model';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  title?: string;
  organizations?: OrganizationMembership[];
  twoFactorEnabled?: boolean;
  /** @deprecated use currentOrgId on AuthService. Kept as a read-only compatibility field until services are fully migrated. */
  clientId?: string;
}
