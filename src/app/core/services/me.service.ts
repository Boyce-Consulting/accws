import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

/** Self-service /me endpoints: password + 2FA. */
@Injectable({ providedIn: 'root' })
export class MeService {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);

  setPassword(password: string, passwordConfirmation: string, currentPassword?: string): Observable<{ message: string }> {
    const body: Record<string, string> = { password, password_confirmation: passwordConfirmation };
    if (currentPassword) body['current_password'] = currentPassword;
    return this.http.post<{ message: string }>(`${this.base}/me/password`, body);
  }

  twoFactorStart(phone: string): Observable<{ enroll_token: string }> {
    return this.http.post<{ enroll_token: string }>(`${this.base}/me/two-factor/start`, { phone });
  }

  twoFactorConfirm(enrollToken: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/me/two-factor/confirm`, {
      enroll_token: enrollToken,
      code,
    });
  }

  twoFactorDisable(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/me/two-factor`);
  }
}
