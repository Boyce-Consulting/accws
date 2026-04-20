import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MeService } from '../../../core/services/me.service';

type Method = 'email' | 'sms';
type Step = 'request' | 'email-sent' | 'sms-code' | 'sms-password' | 'sms-done';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-white">Forgot password?</h1>
          <p class="text-primary-200 mt-1">Get a reset link or SMS code.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @switch (step()) {
            @case ('request') {
              <form (ngSubmit)="onRequest()" class="space-y-4">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" autocomplete="email" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                    [disabled]="loading()" />
                </div>

                <div>
                  <span class="block text-sm font-medium text-gray-700 mb-2">Reset via</span>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="method" value="email" [(ngModel)]="method" class="text-accent-500 focus:ring-accent-500" />
                      <span class="text-sm text-gray-700">Email a reset link</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="method" value="sms" [(ngModel)]="method" class="text-accent-500 focus:ring-accent-500" />
                      <span class="text-sm text-gray-700">Send me a code by SMS</span>
                    </label>
                  </div>
                </div>

                @if (error()) {
                  <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error() }}</div>
                }

                <button type="submit" [disabled]="loading() || !email"
                  class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                  @if (loading()) { Sending... } @else { Continue }
                </button>

                <a routerLink="/login" class="block text-center text-sm text-gray-500 hover:text-gray-700">Back to sign in</a>
              </form>
            }

            @case ('email-sent') {
              <div class="space-y-4 text-center">
                <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                  If an account exists for <strong>{{ email }}</strong>, we've sent a password reset link. Check your inbox.
                </div>
                <a routerLink="/login" class="block text-sm text-accent-600 hover:underline">Back to sign in</a>
              </div>
            }

            @case ('sms-code') {
              <form (ngSubmit)="onCodeContinue()" class="space-y-4">
                <div class="text-sm text-gray-600">
                  @if (phoneHint()) {
                    Code sent to <strong>{{ phoneHint() }}</strong>. It expires in 15 minutes.
                  } @else {
                    We couldn't send a code — try email reset instead.
                  }
                </div>

                @if (phoneHint()) {
                  <div>
                    <label for="code" class="block text-sm font-medium text-gray-700 mb-1">6-digit code</label>
                    <input id="code" type="text" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" placeholder="123456" autocomplete="one-time-code" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-center text-lg tracking-[0.5em]" />
                  </div>

                  @if (error()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error() }}</div>
                  }

                  <button type="submit" [disabled]="code.length !== 6"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    Continue
                  </button>
                } @else {
                  <button type="button" (click)="resetForm()" class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm">
                    Try email reset instead
                  </button>
                }

                <button type="button" (click)="resetForm()" class="block w-full text-center text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </form>
            }

            @case ('sms-password') {
              <form (ngSubmit)="onSmsReset()" class="space-y-4">
                <div class="text-sm text-gray-600">
                  Code accepted — now choose a new password.
                </div>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input id="password" type="password" [(ngModel)]="password" name="password" autocomplete="new-password" minlength="8" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                    [disabled]="loading()" />
                </div>

                <div>
                  <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                  <input id="password_confirmation" type="password" [(ngModel)]="passwordConfirmation" name="password_confirmation" autocomplete="new-password" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                    [disabled]="loading()" />
                </div>

                @if (error()) {
                  <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error() }}</div>
                }

                <button type="submit" [disabled]="loading() || !password || password !== passwordConfirmation"
                  class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                  @if (loading()) { Resetting... } @else { Set new password }
                </button>

                <button type="button" (click)="step.set('sms-code')" class="block w-full text-center text-sm text-gray-500 hover:text-gray-700">Back</button>
              </form>
            }

            @case ('sms-done') {
              <div class="space-y-4 text-center">
                <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                  Password updated. You can now sign in with your new password.
                </div>
                <a routerLink="/login" class="block text-sm text-accent-600 hover:underline">Go to sign in</a>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private me = inject(MeService);

  email = '';
  method: Method = 'email';
  code = '';
  password = '';
  passwordConfirmation = '';

  step = signal<Step>('request');
  loading = signal(false);
  error = signal<string | null>(null);
  phoneHint = signal<string | null>(null);

  private resetToken = '';

  onRequest(): void {
    if (!this.email) return;
    this.loading.set(true);
    this.error.set(null);

    if (this.method === 'email') {
      this.me.forgotPassword(this.email).subscribe({
        next: () => {
          this.step.set('email-sent');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Could not send reset email.');
          this.loading.set(false);
        },
      });
    } else {
      this.me.forgotPasswordSms(this.email).subscribe({
        next: (res) => {
          this.resetToken = res.reset_token;
          this.phoneHint.set(res.phone_hint);
          this.step.set('sms-code');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Could not start SMS reset.');
          this.loading.set(false);
        },
      });
    }
  }

  onCodeContinue(): void {
    if (this.code.length !== 6) return;
    this.error.set(null);
    this.step.set('sms-password');
  }

  onSmsReset(): void {
    if (this.code.length !== 6 || !this.password) return;
    if (this.password !== this.passwordConfirmation) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.me.resetPasswordSms(this.resetToken, this.code, this.password, this.passwordConfirmation).subscribe({
      next: () => {
        this.step.set('sms-done');
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Invalid or expired code.';
        // If the backend rejects for any code-related reason, bump the user
        // back to the code step so they can retype without losing context.
        if (/code/i.test(msg) || err?.status === 422) {
          this.step.set('sms-code');
        }
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  resetForm(): void {
    this.step.set('request');
    this.code = '';
    this.password = '';
    this.passwordConfirmation = '';
    this.phoneHint.set(null);
    this.resetToken = '';
    this.error.set(null);
  }
}
