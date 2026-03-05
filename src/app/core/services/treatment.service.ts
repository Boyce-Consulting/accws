import { Injectable, inject, computed } from '@angular/core';
import { TreatmentPlan, TreatmentStatus } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/treatments`;

  /** All treatment plans as a readonly computed signal */
  readonly treatments = computed(() => this.mock.treatments());

  /** Look up a single treatment plan by ID */
  getById(id: string): TreatmentPlan | undefined {
    return this.treatments().find(t => t.id === id);
  }

  /** Get all treatment plans for a specific wastewater system */
  getBySystemId(systemId: string): TreatmentPlan[] {
    return this.treatments().filter(t => t.systemId === systemId);
  }

  /** Get all treatment plans for a specific client */
  getByClientId(clientId: string): TreatmentPlan[] {
    return this.treatments().filter(t => t.clientId === clientId);
  }

  /** Get all treatment plans with a specific status */
  getByStatus(status: TreatmentStatus): TreatmentPlan[] {
    return this.treatments().filter(t => t.status === status);
  }

  /** Get all currently active treatment plans */
  getActive(): TreatmentPlan[] {
    return this.getByStatus('active');
  }

  /** Get treatment plans for a specific year */
  getByYear(year: number): TreatmentPlan[] {
    return this.treatments().filter(t => t.year === year);
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new treatment plan.
   * TODO: return this.http.post<TreatmentPlan>(this.apiUrl, plan);
   */
  create(plan: Partial<TreatmentPlan>): void {
    console.log('TODO: Create treatment plan via API', plan);
  }

  /**
   * Update an existing treatment plan.
   * TODO: return this.http.patch<TreatmentPlan>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<TreatmentPlan>): void {
    console.log('TODO: Update treatment plan via API', id, changes);
  }

  /**
   * Delete a treatment plan.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete treatment plan via API', id);
  }
}
