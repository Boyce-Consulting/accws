import { Injectable, inject, computed } from '@angular/core';
import { SampleRecord } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class SamplingService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/samples`;

  /** All sample records as a readonly computed signal */
  readonly samples = computed(() => this.mock.samples());

  /** Look up a single sample record by ID */
  getById(id: string): SampleRecord | undefined {
    return this.samples().find(s => s.id === id);
  }

  /** Get all samples for a specific wastewater system */
  getBySystemId(systemId: string): SampleRecord[] {
    return this.samples()
      .filter(s => s.systemId === systemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /** Get all samples for a specific cell within a system */
  getByCellId(cellId: string): SampleRecord[] {
    return this.samples()
      .filter(s => s.cellId === cellId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /** Get samples within a date range (inclusive) */
  getByDateRange(startDate: string, endDate: string): SampleRecord[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.samples()
      .filter(s => {
        const d = new Date(s.date).getTime();
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /** Get the most recent sample for a given system */
  getLatestBySystemId(systemId: string): SampleRecord | undefined {
    return this.getBySystemId(systemId)[0];
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new sample record.
   * TODO: return this.http.post<SampleRecord>(this.apiUrl, record);
   */
  create(record: Partial<SampleRecord>): void {
    console.log('TODO: Create sample record via API', record);
  }

  /**
   * Update an existing sample record.
   * TODO: return this.http.patch<SampleRecord>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<SampleRecord>): void {
    console.log('TODO: Update sample record via API', id, changes);
  }

  /**
   * Delete a sample record.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete sample record via API', id);
  }
}
