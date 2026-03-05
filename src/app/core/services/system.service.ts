import { Injectable, inject, computed } from '@angular/core';
import { WastewaterSystem, SystemStatus, SystemType } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/systems`;

  /** All wastewater systems as a readonly computed signal */
  readonly systems = computed(() => this.mock.systems());

  /** Look up a single system by ID */
  getById(id: string): WastewaterSystem | undefined {
    return this.systems().find(s => s.id === id);
  }

  /** Get all systems belonging to a specific client */
  getByClientId(clientId: string): WastewaterSystem[] {
    return this.systems().filter(s => s.clientId === clientId);
  }

  /** Filter systems by operational status */
  getByStatus(status: SystemStatus): WastewaterSystem[] {
    return this.systems().filter(s => s.status === status);
  }

  /** Filter systems by type */
  getByType(type: SystemType): WastewaterSystem[] {
    return this.systems().filter(s => s.type === type);
  }

  /** Filter systems by province */
  getByProvince(province: string): WastewaterSystem[] {
    return this.systems().filter(s => s.province === province);
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new wastewater system.
   * TODO: return this.http.post<WastewaterSystem>(this.apiUrl, system);
   */
  create(system: Partial<WastewaterSystem>): void {
    console.log('TODO: Create system via API', system);
  }

  /**
   * Update an existing wastewater system.
   * TODO: return this.http.patch<WastewaterSystem>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<WastewaterSystem>): void {
    console.log('TODO: Update system via API', id, changes);
  }

  /**
   * Delete a wastewater system.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete system via API', id);
  }
}
