import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { WastewaterSystem } from '../../core/models/system.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-system-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Systems" subtitle="Wastewater treatment systems registry" />

    <div class="flex flex-wrap gap-2 mb-6">
      @for (t of types; track t.value) {
        <button
          (click)="typeFilter.set(t.value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          [class]="typeFilter() === t.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
          {{ t.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading systems…</p>
    } @else if (error()) {
      <p class="text-sm text-danger">{{ error() }}</p>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (sys of filteredSystems(); track sys.id) {
          <a [routerLink]="['/systems', sys.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-accent-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ sys.name }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ auth.currentOrg()?.name ?? '' }}</p>
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
        } @empty {
          <p class="text-sm text-gray-500">No systems found.</p>
        }
      </div>
    }
  `,
})
export class SystemListComponent {
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  typeFilter = signal('all');
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  types = [
    { value: 'all', label: 'All Types' },
    { value: 'lagoon', label: 'Lagoons' },
    { value: 'lift-station', label: 'Lift Stations' },
    { value: 'wwtp', label: 'WWTP' },
  ];

  filteredSystems = computed(() => {
    const type = this.typeFilter();
    const list = this.systems();
    return type === 'all' ? list : list.filter((s) => s.type === type);
  });

  constructor() {
    effect(() => {
      // Re-load whenever the active org changes.
      const orgId = this.auth.currentOrgId();
      if (!orgId) {
        this.systems.set([]);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.error.set(null);
      this.systemService.list().subscribe({
        next: (list) => {
          this.systems.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to load systems.');
          this.loading.set(false);
        },
      });
    });
  }

  statusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    const map: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
      healthy: 'green',
      attention: 'yellow',
      critical: 'red',
      offline: 'gray',
    };
    return map[status] ?? 'gray';
  }
}
