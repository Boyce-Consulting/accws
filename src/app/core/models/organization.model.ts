export type OrganizationRole = 'owner' | 'admin' | 'member';
export type OrganizationType = 'multi-system' | 'single-use' | 'regional-collection';
export type OrganizationStatus = 'active' | 'prospect' | 'inactive';

export interface OrganizationMembership {
  id: string;
  name: string;
  slug?: string;
  role: OrganizationRole;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  province?: string;
  notes?: string;
  createdAt?: string;
}
