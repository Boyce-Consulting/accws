import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';

export type AuthProvider = 'local' | 'google' | 'microsoft';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OAuthConfig {
  provider: AuthProvider;
  clientId: string;
  redirectUri: string;
  scope: string;
}

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Jacy Hingley',
    email: 'jacy@accws.ca',
    role: 'admin',
    phone: '(780) 680-8498',
    title: 'Wastewater Account Executive',
  },
  {
    id: 'usr-002',
    name: 'Jackson Roth',
    email: 'jackson.roth@athabascacounty.com',
    role: 'client',
    clientId: 'cli-001',
    title: 'Utilities Manager',
  },
  {
    id: 'usr-003',
    name: 'Ray Menard',
    email: 'ray@accws.ca',
    role: 'admin',
    phone: '(780) 680-8498',
    title: 'Managing Partner',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private router: Router) {
    // Check for saved session
    const saved = localStorage.getItem('accws_user');
    if (saved) {
      try {
        this._currentUser.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem('accws_user');
      }
    }
  }

  /** Mock login - will be replaced with real HTTP call */
  // TODO: Replace with: return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  login(email: string, _password: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    // Simulate network delay
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) {
        this._currentUser.set(user);
        localStorage.setItem('accws_user', JSON.stringify(user));
        this.router.navigate(['/dashboard']);
      } else {
        this._error.set('Invalid credentials');
      }
      this._isLoading.set(false);
    }, 600);
  }

  /** Quick login by role - for demo purposes */
  loginAs(role: UserRole): void {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      this._currentUser.set(user);
      localStorage.setItem('accws_user', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
    }
  }

  /** OAuth login placeholder - will integrate with real OAuth provider */
  // TODO: Implement real OAuth flow
  // 1. Redirect to provider's auth URL
  // 2. Handle callback with auth code
  // 3. Exchange code for token via backend
  // 4. Fetch user profile
  loginWithOAuth(provider: AuthProvider): void {
    this._isLoading.set(true);
    this._error.set(null);

    console.log(`OAuth login initiated with provider: ${provider}`);
    console.log('TODO: Implement real OAuth redirect flow');

    // Simulate OAuth - in production this would redirect to the OAuth provider
    setTimeout(() => {
      // Mock: log in as admin for OAuth demo
      const user = MOCK_USERS[0];
      this._currentUser.set(user);
      localStorage.setItem('accws_user', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
      this._isLoading.set(false);
    }, 800);
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('accws_user');
    this.router.navigate(['/login']);
  }

  /** Get all mock users (for demo role picker) */
  getMockUsers(): User[] {
    return MOCK_USERS;
  }
}
