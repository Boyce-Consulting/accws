import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';
import { map } from 'rxjs';
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
  // The preview endpoint returns the raw object (no { data } envelope).
  preview(token: string): Observable<InvitationPreview> {
    return this.http
      .get<InvitationPreviewDto>(`${this.base}/invitations/${token}`)
      .pipe(map(mapInvitationPreviewFromDto));
  }

  // --- Accept (JWT required, email must match) ---
  accept(token: string): Observable<{ message: string; organization_id?: number; role?: string; grants_admin?: boolean; is_admin?: boolean }> {
    return this.http.post<{ message: string; organization_id?: number; role?: string; grants_admin?: boolean; is_admin?: boolean }>(
      `${this.base}/invitations/${token}/accept`,
      {},
    );
  }

  // --- Register a new account via invite (public, no auth) ---
  register(
    token: string,
    body: { name: string; password: string; password_confirmation: string; email?: string },
  ): Observable<{
    token: string;
    user: { id: number | string; name: string; email: string; is_admin?: boolean; avatar_url?: string | null };
    organization_id?: number | null;
    role?: string;
    grants_admin?: boolean;
  }> {
    return this.http.post<{
      token: string;
      user: { id: number | string; name: string; email: string; is_admin?: boolean; avatar_url?: string | null };
      organization_id?: number | null;
      role?: string;
      grants_admin?: boolean;
    }>(`${this.base}/invitations/${token}/register`, body);
  }

  // --- Org-scoped (owner/admin of org, or system admin) ---
  listForOrg(orgId?: string): Observable<OrgInvitation[]> {
    const id = orgId ?? this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    return this.http
      .get<Envelope<OrgInvitationDto[]>>(`${this.base}/organizations/${id}/invitations`)
      .pipe(unwrapList(mapOrgInvitationFromDto));
  }

  createForOrg(
    opts: { email?: string; phone?: string; role?: InvitationRole },
    orgId?: string,
  ): Observable<OrgInvitation> {
    const id = orgId ?? this.auth.currentOrgId();
    if (!id) return throwError(() => new Error('No active organization'));
    const body: Record<string, string> = { role: opts.role ?? 'member' };
    if (opts.email) body['email'] = opts.email;
    if (opts.phone) body['phone'] = opts.phone;
    return this.http
      .post<{ data: OrgInvitationDto; email_sent?: boolean; sms_sent?: boolean }>(
        `${this.base}/organizations/${id}/invitations`,
        body,
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

  createAdmin(opts: { email?: string; phone?: string }): Observable<AdminInvitation> {
    const body: Record<string, string> = {};
    if (opts.email) body['email'] = opts.email;
    if (opts.phone) body['phone'] = opts.phone;
    return this.http
      .post<Envelope<AdminInvitationDto>>(`${this.base}/admin/admin-invitations`, body)
      .pipe(unwrapItem(mapAdminInvitationFromDto));
  }

  revokeAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/admin-invitations/${id}`);
  }
}
