import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';
import {
  ActivityItem,
  ActivityItemDto,
  AlertItem,
  AlertItemDto,
  DashboardSummary,
  DashboardSummaryDto,
  Envelope,
  mapActivityFromDto,
  mapAlertFromDto,
  mapDashboardFromDto,
  unwrapItem,
  unwrapList,
} from './adapters';

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = inject(API_BASE_URL);

  private scopedUrl(path: string): string | null {
    const id = this.auth.currentOrgId();
    return id ? `${this.base}/organizations/${id}/reporting/${path}` : null;
  }

  dashboard(): Observable<DashboardSummary> {
    const url = this.scopedUrl('dashboard');
    if (!url) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<DashboardSummaryDto>>(url)
      .pipe(unwrapItem(mapDashboardFromDto));
  }

  activity(limit = 10): Observable<ActivityItem[]> {
    const url = this.scopedUrl('activity');
    if (!url) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<ActivityItemDto[]>>(`${url}?limit=${limit}`)
      .pipe(unwrapList(mapActivityFromDto));
  }

  alerts(): Observable<AlertItem[]> {
    const url = this.scopedUrl('alerts');
    if (!url) return throwError(() => new Error('No active organization'));
    return this.http.get<Envelope<AlertItemDto[]>>(url).pipe(unwrapList(mapAlertFromDto));
  }
}
