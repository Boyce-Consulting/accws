import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteVisitService } from '../../core/services/site-visit.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import {
  SiteVisit,
  VisitStatus,
  LagoonObservation,
  LiftStationObservation,
  WWTPObservation,
} from '../../core/models/site-visit.model';
import { WastewaterSystem } from '../../core/models/system.model';

@Component({
  selector: 'app-site-visit-list',
  imports: [RouterLink, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Site Visits" subtitle="Field observation and activity logs" />

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex gap-2 flex-wrap">
        @for (f of statusFilters; track f.value) {
          <button
            (click)="activeStatus.set(f.value)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            [class]="activeStatus() === f.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
            {{ f.label }}
            @if (f.value !== 'all') {
              <span class="ml-1 text-xs opacity-75">({{ statusCount(f.value) }})</span>
            }
          </button>
        }
      </div>

      <div class="sm:ml-auto">
        <select
          (change)="activeSystemType.set($any($event.target).value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
          @for (t of systemTypeFilters; track t.value) {
            <option [value]="t.value" [selected]="activeSystemType() === t.value">{{ t.label }}</option>
          }
        </select>
      </div>
    </div>

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading visits…</p>
    } @else {
      <div class="space-y-4">
        @for (visit of filteredVisits(); track visit.id) {
          <a [routerLink]="['/site-visits', visit.id]"
             class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-gray-900 truncate">{{ systemName(visit.systemId) }}</h3>
                  @if (visit.followUpRequired) {
                    <span class="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500" title="Follow-up required"></span>
                  }
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ auth.currentOrg()?.name ?? '' }} &bull; {{ formatDate(visit.visitDate) }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                @if (visit.photoIds.length > 0) {
                  <span class="inline-flex items-center gap-1 text-xs text-gray-400" title="Photos">
                    {{ visit.photoIds.length }}
                  </span>
                }
                <app-status-badge [label]="formatStatus(visit.status)" [color]="statusColor(visit.status)" />
              </div>
            </div>

            @if (visit.activities.length > 0) {
              <div class="flex flex-wrap gap-1.5 mb-3">
                @for (activity of visit.activities; track activity.type) {
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                    {{ formatActivityType(activity.type) }}
                  </span>
                }
              </div>
            }

            <p class="text-xs text-gray-500 mb-2 line-clamp-2">{{ observationSummary(visit) }}</p>

            <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
              <span>Visited by {{ visit.visitedBy || 'ACCWS' }}</span>
              @if (visit.followUpRequired) {
                <span class="text-red-500 font-medium">Follow-up required</span>
              }
            </div>
          </a>
        } @empty {
          <div class="text-center py-12 text-gray-400 text-sm">No site visits found</div>
        }
      </div>
    }
  `,
})
export class SiteVisitListComponent {
  private siteVisitService = inject(SiteVisitService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  activeStatus = signal<string>('all');
  activeSystemType = signal<string>('all');
  visits = signal<SiteVisit[]>([]);
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);

  statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In Progress' },
  ];

  systemTypeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'lagoon', label: 'Lagoons' },
    { value: 'lift-station', label: 'Lift Stations' },
    { value: 'wwtp', label: 'WWTP' },
  ];

  filteredVisits = computed(() => {
    let list = [...this.visits()].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    const status = this.activeStatus();
    if (status !== 'all') list = list.filter((v) => v.status === status);
    const type = this.activeSystemType();
    if (type !== 'all') {
      const sysById = new Map(this.systems().map((s) => [s.id, s]));
      list = list.filter((v) => sysById.get(v.systemId)?.type === type);
    }
    return list;
  });

  statusCount(status: string): number {
    return this.visits().filter((v) => v.status === status).length;
  }

  systemName(id: string): string {
    return this.systems().find((s) => s.id === id)?.name ?? 'Unknown';
  }

  constructor() {
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId) {
        this.visits.set([]);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.siteVisitService.list().subscribe({
        next: (v) => {
          this.visits.set(v);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.systemService.list().subscribe({
        next: (s) => this.systems.set(s),
      });
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatStatus(status: VisitStatus): string {
    return status.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  statusColor(status: VisitStatus): 'green' | 'blue' | 'yellow' | 'gray' {
    const m: Record<VisitStatus, 'green' | 'blue' | 'yellow' | 'gray'> = {
      completed: 'green',
      scheduled: 'blue',
      'in-progress': 'yellow',
      cancelled: 'gray',
    };
    return m[status] ?? 'gray';
  }

  formatActivityType(type: string): string {
    return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  observationSummary(visit: SiteVisit): string {
    const obs = visit.observation;
    if (!obs) return 'No observations recorded';
    if (obs.systemType === 'lift-station') {
      const ls = obs as LiftStationObservation;
      const parts: string[] = [];
      if (ls.odour) parts.push(`Odour: ${ls.odour.intensity}/5`);
      if (ls.fogPresent && ls.fogSurfaceCoveragePct != null) parts.push(`FOG: ${ls.fogSurfaceCoveragePct}%`);
      if (ls.h2sReading != null) parts.push(`H₂S: ${ls.h2sReading} ppm`);
      return parts.join(' | ') || 'No observations recorded';
    }
    if (obs.systemType === 'lagoon') {
      const lg = obs as LagoonObservation;
      const parts: string[] = [];
      if (lg.waterColour?.length) parts.push(`Water: ${lg.waterColour.join(', ')}`);
      if (lg.algaePresent && lg.algaeType?.length) parts.push(`Algae: ${lg.algaeType.join(', ')}`);
      if (lg.odour) parts.push(`Odour: ${lg.odour.intensity}/5`);
      return parts.join(' | ') || 'No observations recorded';
    }
    if (obs.systemType === 'wwtp') {
      const ww = obs as WWTPObservation;
      const parts: string[] = [`Effluent: ${ww.effluentClarity.replace('-', ' ')}`];
      if (ww.odour) parts.push(`Odour: ${ww.odour.intensity}/5`);
      return parts.join(' | ');
    }
    return 'No observations recorded';
  }
}
