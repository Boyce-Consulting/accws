import { Injectable, inject, computed } from '@angular/core';
import { Proposal, ProposalStatus } from '../models';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/proposals`;

  /** All proposals as a readonly computed signal */
  readonly proposals = computed(() => this.mock.proposals());

  /** Look up a single proposal by ID */
  getById(id: string): Proposal | undefined {
    return this.proposals().find(p => p.id === id);
  }

  /** Get all proposals for a specific client */
  getByClientId(clientId: string): Proposal[] {
    return this.proposals().filter(p => p.clientId === clientId);
  }

  /** Filter proposals by status */
  getByStatus(status: ProposalStatus): Proposal[] {
    return this.proposals().filter(p => p.status === status);
  }

  /** Get proposals prepared by a specific person */
  getByPreparedBy(preparedBy: string): Proposal[] {
    return this.proposals().filter(p => p.preparedBy === preparedBy);
  }

  /** Get total pipeline value (sum of all sent proposals) */
  getPipelineValue(): number {
    return this.getByStatus('sent').reduce((sum, p) => sum + p.total, 0);
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new proposal.
   * TODO: return this.http.post<Proposal>(this.apiUrl, proposal);
   */
  create(proposal: Partial<Proposal>): void {
    console.log('TODO: Create proposal via API', proposal);
  }

  /**
   * Update an existing proposal.
   * TODO: return this.http.patch<Proposal>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<Proposal>): void {
    console.log('TODO: Update proposal via API', id, changes);
  }

  /**
   * Delete a proposal.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete proposal via API', id);
  }

  /**
   * Update proposal status only (e.g., draft -> sent, sent -> accepted).
   * TODO: return this.http.patch<Proposal>(`${this.apiUrl}/${id}/status`, { status });
   */
  updateStatus(id: string, status: ProposalStatus): void {
    console.log('TODO: Update proposal status via API', id, status);
  }
}
