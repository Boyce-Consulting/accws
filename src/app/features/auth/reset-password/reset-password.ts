import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MeService } from '../../../core/services/me.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-white">Set a new password</h1>
          @if (email) {
            <p class="text-primary-200 mt-1">For {{ email }}</p>
          }
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @if (!token || !email) {
            <div class="space-y-4 text-center">
              <p class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-3">
                This reset link is invalid or incomplete. Request a new one.
              </p>
              <a routerLink="/auth/forgot-password" class="text-sm text-accent-600 hover:underline">Request a new link</a>
            </div>
          } @else if (success()) {
            <div class="space-y-4 text-center">
              <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                Password updated. You can now sign in with your new password.
              </div>
              <a routerLink="/login" class="block text-sm text-accent-600 hover:underline">Go to sign in</a>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" class="space-y-4">
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
                @if (loading()) { Saving... } @else { Set new password }
              </button>

              <a routerLink="/login" class="block text-center text-sm text-gray-500 hover:text-gray-700">Back to sign in</a>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private me = inject(MeService);

  token = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.token = params.get('token') ?? '';
    this.email = params.get('email') ?? '';
  }

  onSubmit(): void {
    if (!this.token || !this.email || !this.password) return;
    if (this.password !== this.passwordConfirmation) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.me.resetPassword(this.token, this.email, this.password, this.passwordConfirmation).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not reset password. The link may have expired.');
        this.loading.set(false);
      },
    });
  }
}
