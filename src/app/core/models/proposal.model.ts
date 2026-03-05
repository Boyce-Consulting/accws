export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface ProposalLineItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
  status: ProposalStatus;
  lineItems: ProposalLineItem[];
  subtotal: number;
  discount?: number;
  discountLabel?: string;
  gst?: number;
  shipping?: number;
  total: number;
  preparedBy: string;
  preparedFor: string;
  notes?: string;
  validUntil?: string;
}
