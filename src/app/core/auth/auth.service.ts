import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_BASE_URL, JWT_STORAGE_KEY } from '../services/api.config';
import { User, UserRole } from '../models/user.model';
import { OrganizationMembership } from '../models/organization.model';

export type AuthProvider = 'local' | 'google' | 'microsoft';

export interface LoginRequest {
  email: string;
  password: string;
}

const ORG_STORAGE_KEY = 'accws_org_id';
const PENDING_INVITE_KEY = 'accws_pending_invite_token';

interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  is_admin?: boolean;
  avatar_url?: string | null;
  phone?: string | null;
  title?: string | null;
}

interface BackendOrgMembership {
  id: number | string;
  name: string;
  slug?: string;
  role: 'owner' | 'member';
}

interface MeResponse {
  user: BackendUser;
  is_admin: boolean;
  two_factor_enabled?: boolean;
  organizations?: BackendOrgMembership[];
}

interface TokenResponse {
  token: string;
  user: BackendUser;
}

interface TwoFactorRequiredResponse {
  two_factor_required: true;
  challenge_token: string;
}

interface MustEnrollResponse {
  must_enroll_2fa: true;
  enroll_token: string;
  user: Partial<BackendUser>;
}

export type LoginResponse = TokenResponse | TwoFactorRequiredResponse | MustEnrollResponse;

export function isTokenResponse(r: LoginResponse): r is TokenResponse {
  return 'token' in r;
}
export function isTwoFactorRequired(r: LoginResponse): r is TwoFactorRequiredResponse {
  return 'two_factor_required' in r;
}
export function isMustEnroll(r: LoginResponse): r is MustEnrollResponse {
  return 'must_enroll_2fa' in r;
}

function mapMembership(m: BackendOrgMembership): OrganizationMembership {
  return { id: String(m.id), name: m.name, slug: m.slug, role: m.role };
}

function mapUser(u: BackendUser, extras: Partial<User> = {}): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: (u.is_admin ? 'admin' : 'client') as UserRole,
    avatar: u.avatar_url ?? undefined,
    phone: u.phone ?? undefined,
    title: u.title ?? undefined,
    ...extras,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = inject(API_BASE_URL);

  private _token = signal<string | null>(localStorage.getItem(JWT_STORAGE_KEY));
  private _currentUser = signal<User | null>(null);
  private _organizations = signal<OrganizationMembership[]>([]);
  private _currentOrgId = signal<string | null>(localStorage.getItem(ORG_STORAGE_KEY));
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly organizations = this._organizations.asReadonly();
  readonly currentOrgId = this._currentOrgId.asReadonly();
  readonly currentOrg = computed(() => {
    const id = this._currentOrgId();
    return id ? this._organizations().find((o) => o.id === id) ?? null : null;
  });
  readonly isAuthenticated = computed(() => !!this._token());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    if (this._token()) {
      this.loadMe().subscribe();
    }
    effect(() => {
      const id = this._currentOrgId();
      if (id) localStorage.setItem(ORG_STORAGE_KEY, id);
      else localStorage.removeItem(ORG_STORAGE_KEY);
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        if (isTokenResponse(res)) {
          this.applyToken(res.token, res.user);
        }
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._error.set(err?.error?.message ?? 'Login failed');
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  verifyTwoFactor(challengeToken: string, code: string): Observable<TokenResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/auth/two-factor/verify`, {
        challenge_token: challengeToken,
        code,
      })
      .pipe(
        tap((res) => {
          this.applyToken(res.token, res.user);
          this._isLoading.set(false);
        }),
        catchError((err) => {
          this._error.set(err?.error?.message ?? 'Invalid or expired code.');
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  enrollStart(enrollToken: string, phone: string): Observable<{ enroll_token: string }> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http
      .post<{ enroll_token: string }>(`${this.apiUrl}/auth/two-factor/enroll/start`, {
        enroll_token: enrollToken,
        phone,
      })
      .pipe(
        tap(() => this._isLoading.set(false)),
        catchError((err) => {
          this._error.set(err?.error?.message ?? 'Could not send SMS.');
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  enrollConfirm(enrollToken: string, code: string): Observable<TokenResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/auth/two-factor/enroll/confirm`, {
        enroll_token: enrollToken,
        code,
      })
      .pipe(
        tap((res) => {
          this.applyToken(res.token, res.user);
          this._isLoading.set(false);
        }),
        catchError((err) => {
          this._error.set(err?.error?.message ?? 'Invalid or expired code.');
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  loadMe(): Observable<User | null> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`).pipe(
      map((res) => {
        const memberships = (res.organizations ?? []).map(mapMembership);
        const user = mapUser(
          { ...res.user, is_admin: res.is_admin },
          {
            organizations: memberships,
            twoFactorEnabled: res.two_factor_enabled,
            clientId: memberships[0]?.id,
          },
        );
        this._currentUser.set(user);
        this._organizations.set(memberships);
        this.reconcileCurrentOrg(memberships);
        return user;
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  refresh(): Observable<string> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      map((res) => {
        this._token.set(res.token);
        localStorage.setItem(JWT_STORAGE_KEY, res.token);
        return res.token;
      }),
    );
  }

  logout(): void {
    if (this._token()) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this._organizations.set([]);
    this._currentOrgId.set(null);
    localStorage.removeItem(JWT_STORAGE_KEY);
  }

  setCurrentOrg(orgId: string | null): void {
    this._currentOrgId.set(orgId);
  }

  loginWithOAuth(_provider: AuthProvider): void {
    this._error.set('OAuth sign-in is not configured yet.');
  }

  // --- Phone sign-in (STUBBED) ---------------------------------------------
  phoneStart(phone: string): Observable<{ challenge_token: string }> {
    this._isLoading.set(true);
    this._error.set(null);
    return new Observable((sub) => {
      const t = setTimeout(() => {
        this._isLoading.set(false);
        sub.next({ challenge_token: `stub-phone-${phone}` });
        sub.complete();
      }, 500);
      return () => clearTimeout(t);
    });
  }

  phoneVerify(_challengeToken: string, code: string): Observable<TokenResponse> {
    this._isLoading.set(true);
    this._error.set(null);
    return new Observable<TokenResponse>((sub) => {
      const t = setTimeout(() => {
        if (!/^\d{6}$/.test(code)) {
          this._error.set('Invalid or expired code.');
          this._isLoading.set(false);
          sub.error({ error: { message: 'Invalid code' } });
          return;
        }
        const fake: TokenResponse = {
          token: 'stub-phone-jwt',
          user: {
            id: 'stub-phone',
            name: 'Phone User',
            email: 'phone@stub.local',
            is_admin: false,
          },
        };
        this.applyToken(fake.token, fake.user);
        this._isLoading.set(false);
        sub.next(fake);
        sub.complete();
      }, 500);
      return () => clearTimeout(t);
    });
  }

  private applyToken(token: string, backendUser: BackendUser): void {
    this._token.set(token);
    localStorage.setItem(JWT_STORAGE_KEY, token);
    this._currentUser.set(mapUser(backendUser));
    // Hydrate orgs + route post-login.
    this.loadMe().subscribe({
      next: () => this.postLoginNavigate(),
      error: () => this.postLoginNavigate(),
    });
  }

  private postLoginNavigate(): void {
    const pendingInvite = localStorage.getItem(PENDING_INVITE_KEY);
    if (pendingInvite) {
      this.router.navigate(['/invitations', pendingInvite]);
      return;
    }
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/dashboard');
  }

  private reconcileCurrentOrg(memberships: OrganizationMembership[]): void {
    const stored = this._currentOrgId();
    const storedStillValid = stored && memberships.some((m) => m.id === stored);
    if (storedStillValid) return;
    if (memberships.length === 1) {
      this._currentOrgId.set(memberships[0].id);
    } else if (memberships.length > 1) {
      this._currentOrgId.set(memberships[0].id);
    } else {
      this._currentOrgId.set(null);
    }
  }
}
