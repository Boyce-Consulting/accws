import { Injectable, inject, computed } from '@angular/core';
import { Client, ClientStatus } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/clients`;

  /** All clients as a readonly computed signal */
  readonly clients = computed(() => this.mock.clients());

  /** Look up a single client by ID */
  getById(id: string): Client | undefined {
    return this.clients().find(c => c.id === id);
  }

  /** Filter clients by status */
  getByStatus(status: ClientStatus): Client[] {
    return this.clients().filter(c => c.status === status);
  }

  /** Filter clients by province */
  getByProvince(province: string): Client[] {
    return this.clients().filter(c => c.province === province);
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new client.
   * TODO: return this.http.post<Client>(this.apiUrl, client);
   */
  create(client: Partial<Client>): void {
    console.log('TODO: Create client via API', client);
  }

  /**
   * Update an existing client.
   * TODO: return this.http.patch<Client>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<Client>): void {
    console.log('TODO: Update client via API', id, changes);
  }

  /**
   * Delete a client.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete client via API', id);
  }
}
