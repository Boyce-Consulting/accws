export type ClientType = 'multi-system' | 'single-use' | 'regional-collection';
export type ClientStatus = 'active' | 'prospect' | 'inactive';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  province: string;
  systemIds: string[];
  proposalIds: string[];
  notes?: string;
  createdAt: string;
}
