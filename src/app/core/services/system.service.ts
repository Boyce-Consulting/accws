import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { WastewaterSystem } from '../models/system.model';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';
import {
  Envelope,
  SampleDto,
  SiteVisitDto,
  SystemDto,
  mapSampleFromDto,
  mapSiteVisitFromDto,
  mapSystemFromDto,
  unwrapItem,
  unwrapList,
} from './adapters';
import { SampleRecord } from '../models/sampling.model';
import { SiteVisit } from '../models/site-visit.model';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = inject(API_BASE_URL);

  private orgUrl(): Observable<string> | string {
    const id = this.auth.currentOrgId();
    return id ? `${this.base}/organizations/${id}` : throwError(() => new Error('No active organization'));
  }

  list(): Observable<WastewaterSystem[]> {
    const id = this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<SystemDto[]>>(`${this.base}/organizations/${id}/systems`)
      .pipe(unwrapList(mapSystemFromDto));
  }

  get(systemId: string): Observable<WastewaterSystem> {
    const id = this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<SystemDto>>(`${this.base}/organizations/${id}/systems/${systemId}`)
      .pipe(unwrapItem(mapSystemFromDto));
  }

  listVisits(systemId: string): Observable<SiteVisit[]> {
    const id = this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<SiteVisitDto[]>>(
        `${this.base}/organizations/${id}/systems/${systemId}/site-visits`,
      )
      .pipe(unwrapList(mapSiteVisitFromDto));
  }

  listSamples(systemId: string): Observable<SampleRecord[]> {
    const id = this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<SampleDto[]>>(
        `${this.base}/organizations/${id}/systems/${systemId}/sampling`,
      )
      .pipe(unwrapList(mapSampleFromDto));
  }
}
