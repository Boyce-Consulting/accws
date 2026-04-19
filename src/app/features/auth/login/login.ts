import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AuthProvider,
  AuthService,
  isMustEnroll,
  isTokenResponse,
  isTwoFactorRequired,
} from '../../../core/auth/auth.service';

type Step = 'credentials' | 'two-factor' | 'enroll-phone' | 'enroll-code' | 'phone-number' | 'phone-code';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <svg class="w-10 h-10 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">ACC Wastewater Solutions</h1>
          <p class="text-primary-200 mt-1">Wastewater Management Platform</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @switch (step()) {
            @case ('credentials') {
              <div class="space-y-3 mb-6">
                <button
                  (click)="loginWithOAuth('google')"
                  [disabled]="auth.isLoading()"
                  class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50">
                  <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
                <button
                  (click)="step.set('phone-number')"
                  [disabled]="auth.isLoading()"
                  class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50">
                  <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5h3m-6.75 3h10.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Zm3.75 13.5h3"/>
                  </svg>
                  Sign in with phone
                </button>
              </div>

              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white text-gray-500">or sign in with email</span>
                </div>
              </div>

              <form (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" autocomplete="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors text-sm"
                    [disabled]="auth.isLoading()" />
                </div>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" autocomplete="current-password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-colors text-sm"
                    [disabled]="auth.isLoading()" />
                </div>

                @if (auth.error()) {
                  <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                }

                <button type="submit" [disabled]="auth.isLoading()"
                  class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm">
                  @if (auth.isLoading()) { <span>Signing in...</span> } @else { Sign In }
                </button>
              </form>
            }

            @case ('two-factor') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Two-factor verification</h2>
                  <p class="text-sm text-gray-500 mt-1">We sent a 6-digit code to your phone. Enter it below.</p>
                </div>
                <form (ngSubmit)="onVerifyTwoFactor()" class="space-y-4">
                  <input type="text" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" placeholder="123456" autocomplete="one-time-code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-center text-lg tracking-[0.5em]"
                    [disabled]="auth.isLoading()" />
                  @if (auth.error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                  }
                  <button type="submit" [disabled]="auth.isLoading() || code.length !== 6"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (auth.isLoading()) { Verifying... } @else { Verify }
                  </button>
                  <button type="button" (click)="reset()" class="w-full text-sm text-gray-500 hover:text-gray-700">Back to sign in</button>
                </form>
              </div>
            }

            @case ('enroll-phone') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Set up two-factor</h2>
                  <p class="text-sm text-gray-500 mt-1">Two-factor is required for admins. Enter a mobile number to receive your code by SMS.</p>
                </div>
                <form (ngSubmit)="onEnrollStart()" class="space-y-4">
                  <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+17805551234" autocomplete="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                    [disabled]="auth.isLoading()" />
                  <p class="text-xs text-gray-500">Use E.164 format: <code>+</code> country code + number.</p>
                  @if (auth.error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                  }
                  <button type="submit" [disabled]="auth.isLoading() || !phone"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (auth.isLoading()) { Sending... } @else { Send Code }
                  </button>
                  <button type="button" (click)="reset()" class="w-full text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </form>
              </div>
            }

            @case ('phone-number') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Sign in with phone</h2>
                  <p class="text-sm text-gray-500 mt-1">Enter your mobile number and we'll text you a 6-digit code.</p>
                </div>
                <form (ngSubmit)="onPhoneStart()" class="space-y-4">
                  <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+17805551234" autocomplete="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                    [disabled]="auth.isLoading()" />
                  <p class="text-xs text-gray-500">Use E.164 format: <code>+</code> country code + number.</p>
                  @if (auth.error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                  }
                  <button type="submit" [disabled]="auth.isLoading() || !phone"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (auth.isLoading()) { Sending... } @else { Send Code }
                  </button>
                  <button type="button" (click)="reset()" class="w-full text-sm text-gray-500 hover:text-gray-700">Back to sign in</button>
                </form>
              </div>
            }

            @case ('phone-code') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Enter code</h2>
                  <p class="text-sm text-gray-500 mt-1">We sent a 6-digit code to {{ phone }}.</p>
                </div>
                <form (ngSubmit)="onPhoneVerify()" class="space-y-4">
                  <input type="text" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" placeholder="123456" autocomplete="one-time-code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-center text-lg tracking-[0.5em]"
                    [disabled]="auth.isLoading()" />
                  @if (auth.error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                  }
                  <button type="submit" [disabled]="auth.isLoading() || code.length !== 6"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (auth.isLoading()) { Verifying... } @else { Verify }
                  </button>
                  <button type="button" (click)="step.set('phone-number')" class="w-full text-sm text-gray-500 hover:text-gray-700">Use a different number</button>
                </form>
              </div>
            }

            @case ('enroll-code') {
              <div class="space-y-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Confirm your phone</h2>
                  <p class="text-sm text-gray-500 mt-1">Enter the 6-digit code we just sent to {{ phone }}.</p>
                </div>
                <form (ngSubmit)="onEnrollConfirm()" class="space-y-4">
                  <input type="text" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" placeholder="123456" autocomplete="one-time-code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-center text-lg tracking-[0.5em]"
                    [disabled]="auth.isLoading()" />
                  @if (auth.error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ auth.error() }}</div>
                  }
                  <button type="submit" [disabled]="auth.isLoading() || code.length !== 6"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (auth.isLoading()) { Confirming... } @else { Confirm }
                  </button>
                  <button type="button" (click)="step.set('enroll-phone')" class="w-full text-sm text-gray-500 hover:text-gray-700">Use a different number</button>
                </form>
              </div>
            }
          }
        </div>

        <p class="text-center text-primary-300 text-xs mt-6">&copy; 2026 ACC Wastewater Solutions &bull; Red Deer County, AB</p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  step = signal<Step>('credentials');
  email = '';
  password = '';
  code = '';
  phone = '';

  private challengeToken = '';
  private enrollToken = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        if (isTokenResponse(res)) return; // service handles nav
        if (isTwoFactorRequired(res)) {
          this.challengeToken = res.challenge_token;
          this.code = '';
          this.step.set('two-factor');
        } else if (isMustEnroll(res)) {
          this.enrollToken = res.enroll_token;
          this.step.set('enroll-phone');
        }
      },
    });
  }

  onVerifyTwoFactor(): void {
    if (this.code.length !== 6) return;
    this.auth.verifyTwoFactor(this.challengeToken, this.code).subscribe();
  }

  onEnrollStart(): void {
    if (!this.phone) return;
    this.auth.enrollStart(this.enrollToken, this.phone).subscribe({
      next: (res) => {
        this.enrollToken = res.enroll_token;
        this.code = '';
        this.step.set('enroll-code');
      },
    });
  }

  onEnrollConfirm(): void {
    if (this.code.length !== 6) return;
    this.auth.enrollConfirm(this.enrollToken, this.code).subscribe();
  }

  onPhoneStart(): void {
    if (!this.phone) return;
    this.auth.phoneStart(this.phone).subscribe({
      next: (res) => {
        this.challengeToken = res.challenge_token;
        this.code = '';
        this.step.set('phone-code');
      },
    });
  }

  onPhoneVerify(): void {
    if (this.code.length !== 6) return;
    this.auth.phoneVerify(this.challengeToken, this.code).subscribe();
  }

  loginWithOAuth(provider: AuthProvider): void {
    this.auth.loginWithOAuth(provider);
  }

  reset(): void {
    this.step.set('credentials');
    this.code = '';
    this.phone = '';
    this.challengeToken = '';
    this.enrollToken = '';
  }
}
