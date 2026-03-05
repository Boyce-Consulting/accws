import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-system-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Systems" subtitle="Wastewater treatment systems registry" />

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        (click)="typeFilter.set('all')"
        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
        [class]="typeFilter() === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
        All Types
      </button>
      <button
        (click)="typeFilter.set('lagoon')"
        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
        [class]="typeFilter() === 'lagoon' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
        Lagoons
      </button>
      <button
        (click)="typeFilter.set('lift-station')"
        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
        [class]="typeFilter() === 'lift-station' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
        Lift Stations
      </button>
      <button
        (click)="typeFilter.set('wwtp')"
        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
        [class]="typeFilter() === 'wwtp' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
        WWTP
      </button>
    </div>

    <!-- System Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (sys of filteredSystems(); track sys.id) {
        <a [routerLink]="['/systems', sys.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-accent-200 transition-all">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ sys.name }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ getClientName(sys.clientId) }}</p>
            </div>
            <app-status-badge [label]="sys.status | titlecase" [color]="statusColor(sys.status)" />
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span class="capitalize">{{ sys.type }}</span>
            <span>&bull;</span>
            <span>{{ sys.cells.length }} cell{{ sys.cells.length !== 1 ? 's' : '' }}</span>
            @if (sys.province) {
              <span>&bull;</span>
              <span>{{ sys.province }}</span>
            }
          </div>
          <div class="flex gap-3">
            @if (sys.population) {
              <div class="text-xs">
                <span class="text-gray-400">Pop:</span>
                <span class="font-medium text-gray-700 ml-1">~{{ sys.population.toLocaleString() }}</span>
              </div>
            }
            @if (sys.flowRate) {
              <div class="text-xs">
                <span class="text-gray-400">Flow:</span>
                <span class="font-medium text-gray-700 ml-1">{{ sys.flowRate }} m3/day</span>
              </div>
            }
          </div>
        </a>
      }
    </div>
  `,
})
export class SystemListComponent {
  private systemService = inject(SystemService);
  private clientService = inject(ClientService);
  private auth = inject(AuthService);

  typeFilter = signal('all');

  filteredSystems = computed(() => {
    const type = this.typeFilter();
    let systems = this.systemService.systems();

    // Client users only see their own systems
    if (!this.auth.isAdmin()) {
      const clientId = this.auth.currentUser()?.clientId;
      if (clientId) {
        systems = systems.filter(s => s.clientId === clientId);
      }
    }

    if (type !== 'all') {
      systems = systems.filter(s => s.type === type);
    }
    return systems;
  });

  getClientName(clientId: string): string {
    return this.clientService.getById(clientId)?.name ?? 'Unknown';
  }

  statusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    const map: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = { healthy: 'green', attention: 'yellow', critical: 'red', offline: 'gray' };
    return map[status] ?? 'gray';
  }
}
