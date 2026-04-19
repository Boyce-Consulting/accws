import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';
import { API_BASE_URL } from './api.config';
import {
  Envelope,
  OrganizationDto,
  mapOrganizationFromDto,
  unwrapItem,
  unwrapList,
} from './adapters';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);

  /** Memberships for the authenticated user. */
  list(): Observable<Organization[]> {
    return this.http
      .get<Envelope<OrganizationDto[]>>(`${this.base}/organizations`)
      .pipe(unwrapList(mapOrganizationFromDto));
  }

  get(id: string): Observable<Organization> {
    return this.http
      .get<Envelope<OrganizationDto>>(`${this.base}/organizations/${id}`)
      .pipe(unwrapItem(mapOrganizationFromDto));
  }

  /** Admin-only: every org in the system. */
  listAdmin(): Observable<Organization[]> {
    return this.http
      .get<Envelope<OrganizationDto[]>>(`${this.base}/admin/organizations`)
      .pipe(unwrapList(mapOrganizationFromDto));
  }
}
