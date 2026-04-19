import { Injectable, signal } from '@angular/core';
import { CaseStudy } from '../models';

/**
 * Case studies are out of scope for v0 and hidden from the nav. This service
 * returns empty data until the /api/case-studies endpoint is wired up.
 */
@Injectable({ providedIn: 'root' })
export class CaseStudyService {
  readonly caseStudies = signal<CaseStudy[]>([]).asReadonly();

  getById(_id: string): CaseStudy | undefined {
    return undefined;
  }
  getByProvince(_p: string): CaseStudy[] {
    return [];
  }
  getBySystemType(_t: string): CaseStudy[] {
    return [];
  }
  getByProduct(_n: string): CaseStudy[] {
    return [];
  }
}
