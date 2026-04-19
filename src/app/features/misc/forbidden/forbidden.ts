import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div class="max-w-md text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Access denied</h1>
        <p class="text-sm text-gray-600 mb-6">
          You don't have permission to view this page, or no organization is selected for your account.
        </p>
        <a routerLink="/dashboard" class="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg">
          Back to dashboard
        </a>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {}
