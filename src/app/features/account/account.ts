import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { MeService } from '../../core/services/me.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

type Tab = 'profile' | 'password' | 'two-factor' | 'organizations';

@Component({
  selector: 'app-account',
  imports: [FormsModule, TitleCasePipe, PageHeaderComponent],
  template: `
    <app-page-header title="My Account" subtitle="Profile, security, and access" />

    <div class="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
      @for (t of visibleTabs(); track t.id) {
        <button (click)="tab.set(t.id)"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          [class]="tab() === t.id ? 'bg-accent-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">
          {{ t.label }}
        </button>
      }
    </div>

    <div class="max-w-3xl">
      @switch (tab()) {
        @case ('profile') {
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {{ initials() }}
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ auth.currentUser()?.name }}</h2>
                <p class="text-sm text-gray-500">{{ auth.currentUser()?.email }}</p>
                @if (auth.currentUser()?.title) { <p class="text-sm text-gray-500">{{ auth.currentUser()?.title }}</p> }
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <p class="text-sm text-gray-900 capitalize">{{ auth.currentUser()?.role }}</p>
              </div>
              @if (auth.currentUser()?.phone) {
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p class="text-sm text-gray-900">{{ auth.currentUser()?.phone }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Two-factor</label>
                <p class="text-sm text-gray-900">{{ auth.currentUser()?.twoFactorEnabled ? 'Enabled' : 'Disabled' }}</p>
              </div>
            </div>
            <div class="border-t border-gray-200 mt-6 pt-6">
              <button (click)="auth.logout()"
                class="px-4 py-2 text-sm font-medium text-danger border border-red-200 rounded-lg hover:bg-red-50">
                Sign Out
              </button>
            </div>
          </div>
        }

        @case ('password') {
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Change password</h2>
            <form (ngSubmit)="submitPassword()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current password <span class="text-gray-400 font-normal">(leave blank if you've never set one)</span></label>
                <input type="password" [(ngModel)]="currentPassword" name="cp" autocomplete="current-password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input type="password" [(ngModel)]="newPassword" name="np" autocomplete="new-password" minlength="8" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <input type="password" [(ngModel)]="newPasswordConfirm" name="npc" autocomplete="new-password" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none" />
              </div>
              @if (pwError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ pwError() }}</div> }
              @if (pwMessage()) { <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{{ pwMessage() }}</div> }
              <button type="submit" [disabled]="pwLoading()"
                class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                @if (pwLoading()) { Saving... } @else { Save password }
              </button>
            </form>
          </div>
        }

        @case ('two-factor') {
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            @if (auth.isAdmin()) {
              <h2 class="text-base font-semibold text-gray-900 mb-2">Two-factor authentication</h2>
              <p class="text-sm text-gray-600 mb-4">Two-factor is required for admin accounts and cannot be disabled.</p>
              <p class="text-sm"><strong>Status:</strong> {{ auth.currentUser()?.twoFactorEnabled ? 'Enabled' : 'Not yet enrolled' }}</p>
            } @else if (auth.currentUser()?.twoFactorEnabled) {
              <h2 class="text-base font-semibold text-gray-900 mb-2">Two-factor authentication</h2>
              <p class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">Enabled — you'll be asked for a 6-digit code each time you sign in.</p>
              <button (click)="disable2FA()" [disabled]="tfLoading()"
                class="text-sm font-medium text-danger border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 disabled:opacity-50">
                Disable two-factor
              </button>
              @if (tfError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{{ tfError() }}</div> }
            } @else {
              <h2 class="text-base font-semibold text-gray-900 mb-2">Enable two-factor</h2>
              <p class="text-sm text-gray-600 mb-4">Add an extra layer of security — we'll text you a 6-digit code at sign-in.</p>

              @if (tfStep() === 'phone') {
                <form (ngSubmit)="start2FA()" class="space-y-4">
                  <input type="tel" [(ngModel)]="tfPhone" name="phone" placeholder="+17805551234" autocomplete="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p class="text-xs text-gray-500">Use E.164 format: <code>+</code> country code + number.</p>
                  @if (tfError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ tfError() }}</div> }
                  <button type="submit" [disabled]="tfLoading() || !tfPhone"
                    class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (tfLoading()) { Sending... } @else { Send code }
                  </button>
                </form>
              } @else {
                <form (ngSubmit)="confirm2FA()" class="space-y-4">
                  <input type="text" inputmode="numeric" maxlength="6" [(ngModel)]="tfCode" name="code" placeholder="123456" autocomplete="one-time-code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-[0.5em]" />
                  @if (tfError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ tfError() }}</div> }
                  <button type="submit" [disabled]="tfLoading() || tfCode.length !== 6"
                    class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (tfLoading()) { Confirming... } @else { Confirm }
                  </button>
                  <button type="button" (click)="tfStep.set('phone')" class="text-sm text-gray-500 hover:text-gray-700 ml-3">Use different number</button>
                </form>
              }
            }
          </div>
        }

        @case ('organizations') {
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">My organizations</h2>
            @if (auth.organizations().length === 0) {
              <p class="text-sm text-gray-500">You aren't a member of any organizations yet.</p>
            } @else {
              <ul class="divide-y divide-gray-100">
                @for (m of auth.organizations(); track m.id) {
                  <li class="flex items-center justify-between py-3">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ m.name }}</p>
                      <p class="text-xs text-gray-500">{{ m.role | titlecase }}</p>
                    </div>
                    @if (auth.currentOrgId() === m.id) {
                      <span class="text-xs text-accent-600 font-medium">Active</span>
                    } @else {
                      <button (click)="auth.setCurrentOrg(m.id)" class="text-xs text-accent-600 hover:underline">Make active</button>
                    }
                  </li>
                }
              </ul>
            }
          </div>
        }


      }
    </div>
  `,
})
export class AccountComponent {
  auth = inject(AuthService);
  private me = inject(MeService);

  tab = signal<Tab>('profile');

  // Password form
  currentPassword = '';
  newPassword = '';
  newPasswordConfirm = '';
  pwLoading = signal(false);
  pwError = signal<string | null>(null);
  pwMessage = signal<string | null>(null);

  // 2FA form
  tfStep = signal<'phone' | 'code'>('phone');
  tfPhone = '';
  tfCode = '';
  private tfEnrollToken = '';
  tfLoading = signal(false);
  tfError = signal<string | null>(null);

  initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  visibleTabs = computed<{ id: Tab; label: string }[]>(() => [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'two-factor', label: 'Two-factor' },
    { id: 'organizations', label: 'Organizations' },
  ]);

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  // --- Password ---
  submitPassword(): void {
    this.pwError.set(null);
    this.pwMessage.set(null);
    if (this.newPassword !== this.newPasswordConfirm) {
      this.pwError.set('Passwords do not match.');
      return;
    }
    this.pwLoading.set(true);
    this.me
      .setPassword(this.newPassword, this.newPasswordConfirm, this.currentPassword || undefined)
      .subscribe({
        next: (r) => {
          this.pwMessage.set(r.message ?? 'Password updated.');
          this.pwLoading.set(false);
          this.currentPassword = this.newPassword = this.newPasswordConfirm = '';
        },
        error: (err) => {
          this.pwError.set(err?.error?.message ?? 'Could not update password.');
          this.pwLoading.set(false);
        },
      });
  }

  // --- 2FA ---
  start2FA(): void {
    this.tfError.set(null);
    this.tfLoading.set(true);
    this.me.twoFactorStart(this.tfPhone).subscribe({
      next: (r) => {
        this.tfEnrollToken = r.enroll_token;
        this.tfStep.set('code');
        this.tfLoading.set(false);
      },
      error: (err) => {
        this.tfError.set(err?.error?.message ?? 'Could not send SMS.');
        this.tfLoading.set(false);
      },
    });
  }

  confirm2FA(): void {
    this.tfError.set(null);
    this.tfLoading.set(true);
    this.me.twoFactorConfirm(this.tfEnrollToken, this.tfCode).subscribe({
      next: () => {
        this.tfLoading.set(false);
        this.tfStep.set('phone');
        this.tfCode = '';
        this.auth.loadMe().subscribe();
      },
      error: (err) => {
        this.tfError.set(err?.error?.message ?? 'Invalid or expired code.');
        this.tfLoading.set(false);
      },
    });
  }

  disable2FA(): void {
    this.tfError.set(null);
    this.tfLoading.set(true);
    this.me.twoFactorDisable().subscribe({
      next: () => {
        this.tfLoading.set(false);
        this.auth.loadMe().subscribe();
      },
      error: (err) => {
        this.tfError.set(err?.error?.message ?? 'Could not disable.');
        this.tfLoading.set(false);
      },
    });
  }

}
