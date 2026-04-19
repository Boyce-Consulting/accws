import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';
import {
  AdminInvitation,
  AdminInvitationDto,
  Envelope,
  InvitationPreview,
  InvitationPreviewDto,
  InvitationRole,
  OrgInvitation,
  OrgInvitationDto,
  mapAdminInvitationFromDto,
  mapInvitationPreviewFromDto,
  mapOrgInvitationFromDto,
  unwrapItem,
  unwrapList,
} from './adapters';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = inject(API_BASE_URL);

  // --- Public (unauthenticated) preview ---
  preview(token: string): Observable<InvitationPreview> {
    return this.http
      .get<Envelope<InvitationPreviewDto>>(`${this.base}/invitations/${token}`)
      .pipe(unwrapItem(mapInvitationPreviewFromDto));
  }

  // --- Accept (JWT required, email must match) ---
  accept(token: string): Observable<{ message: string; organization_id?: number; role?: string }> {
    return this.http.post<{ message: string; organization_id?: number; role?: string }>(
      `${this.base}/invitations/${token}/accept`,
      {},
    );
  }

  // --- Org-scoped (owner/admin of org, or system admin) ---
  listForOrg(orgId?: string): Observable<OrgInvitation[]> {
    const id = orgId ?? this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<OrgInvitationDto[]>>(`${this.base}/organizations/${id}/invitations`)
      .pipe(unwrapList(mapOrgInvitationFromDto));
  }

  createForOrg(email: string, role: InvitationRole = 'member', orgId?: string): Observable<OrgInvitation> {
    const id = orgId ?? this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .post<{ data: OrgInvitationDto; email_sent?: boolean }>(
        `${this.base}/organizations/${id}/invitations`,
        { email, role },
      )
      .pipe(unwrapItem((dto) => mapOrgInvitationFromDto(dto)));
  }

  revokeForOrg(invitationId: string, orgId?: string): Observable<void> {
    const id = orgId ?? this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http.delete<void>(`${this.base}/organizations/${id}/invitations/${invitationId}`);
  }

  // --- System-admin invites (admin only) ---
  listAdmin(): Observable<AdminInvitation[]> {
    return this.http
      .get<Envelope<AdminInvitationDto[]>>(`${this.base}/admin/admin-invitations`)
      .pipe(unwrapList(mapAdminInvitationFromDto));
  }

  createAdmin(email: string): Observable<AdminInvitation> {
    return this.http
      .post<Envelope<AdminInvitationDto>>(`${this.base}/admin/admin-invitations`, { email })
      .pipe(unwrapItem(mapAdminInvitationFromDto));
  }

  revokeAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/admin-invitations/${id}`);
  }
}
