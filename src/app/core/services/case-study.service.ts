import { Injectable, inject, computed } from '@angular/core';
import { CaseStudy } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class CaseStudyService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/case-studies`;

  /** All case studies as a readonly computed signal */
  readonly caseStudies = computed(() => this.mock.caseStudies());

  /** Look up a single case study by ID */
  getById(id: string): CaseStudy | undefined {
    return this.caseStudies().find(cs => cs.id === id);
  }

  /** Filter case studies by province */
  getByProvince(province: string): CaseStudy[] {
    return this.caseStudies().filter(cs => cs.province === province);
  }

  /** Filter case studies by system type */
  getBySystemType(systemType: string): CaseStudy[] {
    return this.caseStudies().filter(cs => cs.systemType === systemType);
  }

  /** Find case studies that featured a specific product */
  getByProduct(productName: string): CaseStudy[] {
    return this.caseStudies().filter(cs =>
      cs.productsUsed.some(p =>
        p.toLowerCase().includes(productName.toLowerCase())
      )
    );
  }
}
