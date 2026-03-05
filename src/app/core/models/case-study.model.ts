export interface CaseStudyResult {
  metric: string;
  before: string;
  after: string;
  changePercent: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  systemType: string;
  location: string;
  province: string;
  problem: string;
  solution: string;
  results: CaseStudyResult[];
  productsUsed: string[];
  duration: string;
  imageUrl?: string;
  createdAt: string;
}
