import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ClientService } from '../../core/services/client.service';
import { ClientStatus } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { AvatarComponent } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-client-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent, AvatarComponent],
  template: `
    <app-page-header title="Clients" subtitle="Manage your municipal clients" />

    <!-- Status filter -->
    <div class="flex gap-2 mb-6">
      @for (f of statusFilters; track f.value) {
        <button
          (click)="activeFilter.set(f.value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          [class]="activeFilter() === f.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
          {{ f.label }}
        </button>
      }
    </div>

    <!-- Client Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (client of filteredClients(); track client.id) {
        <a [routerLink]="['/clients', client.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-accent-200 transition-all">
          <div class="flex items-start gap-3 mb-3">
            <app-avatar [name]="client.name" size="md" bgClass="bg-primary-500" />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 truncate">{{ client.name }}</h3>
              <p class="text-xs text-gray-500">{{ client.type | titlecase }}</p>
            </div>
            <app-status-badge
              [label]="client.status | titlecase"
              [color]="client.status === 'active' ? 'green' : client.status === 'prospect' ? 'blue' : 'gray'" />
          </div>
          <div class="space-y-1.5 text-xs text-gray-600">
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
              </svg>
              {{ client.contactName }}
            </p>
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {{ client.province }}
            </p>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{{ client.systemIds.length }} system{{ client.systemIds.length !== 1 ? 's' : '' }}</span>
            <span>{{ client.proposalIds.length }} proposal{{ client.proposalIds.length !== 1 ? 's' : '' }}</span>
          </div>
        </a>
      }
    </div>
  `,
})
export class ClientListComponent {
  private clientService = inject(ClientService);

  activeFilter = signal('all');

  statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'inactive', label: 'Inactive' },
  ];

  filteredClients = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.clientService.clients();
    return this.clientService.getByStatus(filter as ClientStatus);
  });
}
