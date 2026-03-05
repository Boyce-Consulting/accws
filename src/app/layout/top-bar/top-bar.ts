import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-top-bar',
  template: `
    <header class="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
      <!-- Left: Logo (mobile) / Page context -->
      <div class="flex items-center gap-3">
        <div class="lg:hidden flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">ACC</span>
          </div>
          <span class="font-semibold text-primary-700 text-sm">ACCWS</span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Notifications -->
        <button class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span class="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            (click)="showUserMenu.set(!showUserMenu())"
            class="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <div class="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {{ getInitials() }}
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700">{{ auth.currentUser()?.name }}</span>
            <svg class="hidden sm:block w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          @if (showUserMenu()) {
            <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ auth.currentUser()?.name }}</p>
                <p class="text-xs text-gray-500">{{ auth.currentUser()?.email }}</p>
                <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  [class]="auth.isAdmin() ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'">
                  {{ auth.isAdmin() ? 'Administrator' : 'Client' }}
                </span>
              </div>
              <button
                (click)="auth.logout(); showUserMenu.set(false)"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class TopBarComponent {
  auth = inject(AuthService);
  showUserMenu = signal(false);

  getInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
