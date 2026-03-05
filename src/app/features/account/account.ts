import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-account',
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="My Account" subtitle="Manage your account settings" />
    <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
          {{ getInitials() }}
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ auth.currentUser()?.name }}</h2>
          <p class="text-sm text-gray-500">{{ auth.currentUser()?.email }}</p>
          @if (auth.currentUser()?.title) {
            <p class="text-sm text-gray-500">{{ auth.currentUser()?.title }}</p>
          }
        </div>
      </div>
      <div class="border-t border-gray-200 pt-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>
      <div class="border-t border-gray-200 mt-6 pt-6">
        <button
          (click)="auth.logout()"
          class="px-4 py-2 text-sm font-medium text-danger border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  `,
})
export class AccountComponent {
  auth = inject(AuthService);

  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
