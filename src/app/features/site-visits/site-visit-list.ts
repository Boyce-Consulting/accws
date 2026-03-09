import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteVisitService } from '../../core/services/site-visit.service';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { SiteVisit, VisitStatus, LagoonObservation, LiftStationObservation, WWTPObservation } from '../../core/models/site-visit.model';

@Component({
  selector: 'app-site-visit-list',
  imports: [RouterLink, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Site Visits" subtitle="Field observation and activity logs" />

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <!-- Status Filter -->
      <div class="flex gap-2 flex-wrap">
        @for (f of statusFilters; track f.value) {
          <button
            (click)="activeStatus.set(f.value)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            [class]="activeStatus() === f.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
            {{ f.label }}
            @if (f.value !== 'all') {
              <span class="ml-1 text-xs opacity-75">({{ getStatusCount(f.value) }})</span>
            }
          </button>
        }
      </div>

      <!-- System Type Filter -->
      <div class="sm:ml-auto">
        <select
          (change)="activeSystemType.set($any($event.target).value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
          @for (t of systemTypeFilters; track t.value) {
            <option [value]="t.value" [selected]="activeSystemType() === t.value">{{ t.label }}</option>
          }
        </select>
      </div>
    </div>

    <!-- Visit Cards -->
    <div class="space-y-4">
      @for (visit of filteredVisits(); track visit.id) {
        <a [routerLink]="['/site-visits', visit.id]"
           class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <!-- Header Row: System + Status -->
          <div class="flex items-start justify-between mb-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ getSystemName(visit.systemId) }}</h3>
                @if (visit.followUpRequired) {
                  <span class="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500" title="Follow-up required"></span>
                }
              </div>
              <p class="text-xs text-gray-500 mt-0.5">{{ getClientName(visit.clientId) }} &bull; {{ formatDate(visit.visitDate) }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-3">
              @if (visit.photoIds.length > 0) {
                <span class="inline-flex items-center gap-1 text-xs text-gray-400" title="Photos">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ visit.photoIds.length }}
                </span>
              }
              <app-status-badge
                [label]="formatStatus(visit.status)"
                [color]="statusColor(visit.status)" />
            </div>
          </div>

          <!-- Activities Tags -->
          @if (visit.activities.length > 0) {
            <div class="flex flex-wrap gap-1.5 mb-3">
              @for (activity of visit.activities; track activity.type) {
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                  {{ formatActivityType(activity.type) }}
                </span>
              }
            </div>
          }

          <!-- Observation Summary -->
          <p class="text-xs text-gray-500 mb-2 line-clamp-2">{{ getObservationSummary(visit) }}</p>

          <!-- Footer -->
          <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span>Visited by {{ visit.visitedBy }}</span>
            @if (visit.followUpRequired) {
              <span class="text-red-500 font-medium">Follow-up required</span>
            }
          </div>
        </a>
      } @empty {
        <div class="text-center py-12 text-gray-400 text-sm">No site visits found</div>
      }
    </div>
  `,
})
export class SiteVisitListComponent {
  private siteVisitService = inject(SiteVisitService);
  private systemService = inject(SystemService);
  private clientService = inject(ClientService);
  private auth = inject(AuthService);

  activeStatus = signal<string>('all');
  activeSystemType = signal<string>('all');

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

  /** All visits scoped to admin/client role */
  private scopedVisits = computed(() => {
    let visits = [...this.siteVisitService.siteVisits()];
    if (!this.auth.isAdmin()) {
      const clientId = this.auth.currentUser()?.clientId;
      if (clientId) {
        visits = visits.filter(v => v.clientId === clientId);
      }
    }
    return visits.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  });

  /** Filtered visits based on active status and system type */
  filteredVisits = computed(() => {
    let visits = this.scopedVisits();
    const status = this.activeStatus();
    if (status !== 'all') {
      visits = visits.filter(v => v.status === status);
    }
    const systemType = this.activeSystemType();
    if (systemType !== 'all') {
      visits = visits.filter(v => {
        const system = this.systemService.getById(v.systemId);
        return system?.type === systemType;
      });
    }
    return visits;
  });

  getStatusCount(status: string): number {
    return this.scopedVisits().filter(v => v.status === status).length;
  }

  getSystemName(id: string): string {
    return this.systemService.getById(id)?.name ?? 'Unknown';
  }

  getClientName(id: string): string {
    return this.clientService.getById(id)?.name ?? 'Unknown';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatStatus(status: VisitStatus): string {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  statusColor(status: VisitStatus): 'green' | 'blue' | 'yellow' | 'gray' {
    const map: Record<VisitStatus, 'green' | 'blue' | 'yellow' | 'gray'> = {
      'completed': 'green',
      'scheduled': 'blue',
      'in-progress': 'yellow',
      'cancelled': 'gray',
    };
    return map[status] ?? 'gray';
  }

  formatActivityType(type: string): string {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getObservationSummary(visit: SiteVisit): string {
    const obs = visit.observation;

    if (obs.systemType === 'lift-station') {
      const ls = obs as LiftStationObservation;
      const parts: string[] = [];
      if (ls.odour) {
        parts.push(`Odour: ${ls.odour.intensity}/5`);
      }
      if (ls.fogPresent && ls.fogSurfaceCoveragePct != null) {
        parts.push(`FOG: ${ls.fogSurfaceCoveragePct}% coverage`);
      }
      if (ls.h2sReading != null) {
        parts.push(`H\u2082S: ${ls.h2sReading} ppm`);
      }
      if (ls.flowMeterReading != null) {
        parts.push(`Flow: ${ls.flowMeterReading} m\u00B3/day`);
      }
      return parts.join(' | ') || 'No observations recorded';
    }

    if (obs.systemType === 'lagoon') {
      const lg = obs as LagoonObservation;
      const parts: string[] = [];
      if (lg.waterColour && lg.waterColour.length > 0) {
        parts.push(`Water: ${lg.waterColour.join(', ')}`);
      }
      if (lg.algaePresent && lg.algaeType && lg.algaeType.length > 0) {
        parts.push(`Algae: ${lg.algaeType.join(', ')}`);
      }
      if (lg.odour) {
        parts.push(`Odour: ${lg.odour.intensity}/5`);
      }
      if (lg.cattailSeverity && lg.cattailSeverity !== 'none') {
        parts.push(`Cattails: ${lg.cattailSeverity}`);
      }
      return parts.join(' | ') || 'No observations recorded';
    }

    if (obs.systemType === 'wwtp') {
      const ww = obs as WWTPObservation;
      const parts: string[] = [];
      parts.push(`Effluent: ${ww.effluentClarity.replace('-', ' ')}`);
      if (ww.odour) {
        parts.push(`Odour: ${ww.odour.intensity}/5`);
      }
      return parts.join(' | ') || 'No observations recorded';
    }

    return 'No observations recorded';
  }
}
