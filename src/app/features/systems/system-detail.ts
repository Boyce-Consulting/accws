import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { WastewaterSystem } from '../../core/models/system.model';
import { SampleRecord } from '../../core/models/sampling.model';
import { SiteVisit } from '../../core/models/site-visit.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

type TabId = 'overview' | 'visits' | 'data';

@Component({
  selector: 'app-system-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading system…</p>
    } @else if (error()) {
      <p class="text-sm text-danger">{{ error() }}</p>
    } @else if (system(); as sys) {
      <app-page-header [title]="sys.name" [subtitle]="auth.currentOrg()?.name ?? ''">
        <a routerLink="/systems" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6">
        @for (tab of tabs; track tab.id) {
          <button
            (click)="activeTab.set(tab.id)"
            class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            [class]="activeTab() === tab.id ? 'bg-accent-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'">
            {{ tab.label }}
          </button>
        }
      </div>

      @if (activeTab() === 'overview') {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">Type</p>
            <p class="text-sm font-semibold text-gray-900 capitalize">{{ sys.type }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <app-status-badge [label]="sys.status | titlecase" [color]="statusColor(sys.status)" />
          </div>
          @if (sys.population) {
            <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p class="text-xs text-gray-500 mb-1">Population</p>
              <p class="text-sm font-semibold text-gray-900">~{{ sys.population.toLocaleString() }}</p>
            </div>
          }
          @if (sys.flowRate) {
            <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p class="text-xs text-gray-500 mb-1">Flow Rate</p>
              <p class="text-sm font-semibold text-gray-900">{{ sys.flowRate }} m&sup3;/day</p>
            </div>
          }
        </div>

        @if (sys.description) {
          <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <p class="text-sm text-gray-700">{{ sys.description }}</p>
          </div>
        }

        @if (sys.cells.length > 0) {
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-4 border-b border-gray-200">
              <h2 class="text-base font-semibold text-gray-900">Cells ({{ sys.cells.length }})</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Function</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Area (m&sup2;)</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Volume (m&sup3;)</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Retention (d)</th>
                    @if (hasSludgeData()) {
                      <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Sludge (m&sup3;)</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (cell of sys.cells; track cell.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ cell.name }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 capitalize">{{ cell.function }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.areaM2 || '-' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.volumeM3.toLocaleString() }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.retentionTimeDays ?? '-' }}</td>
                      @if (hasSludgeData()) {
                        <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.sludgeVolumeM3?.toLocaleString() ?? '-' }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (sys.commissioned) {
          <p class="text-xs text-gray-400 mt-4">Commissioned {{ sys.commissioned }} &bull; {{ sys.province }}</p>
        }
      }

      @if (activeTab() === 'visits') {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Site Visits</h2>
          @if (visitsLoading()) {
            <p class="text-sm text-gray-400">Loading…</p>
          } @else if (visits().length > 0) {
            <div class="space-y-3">
              @for (visit of visits(); track visit.id) {
                <a [routerLink]="['/site-visits', visit.id]"
                   class="block p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ visit.visitDate }}</p>
                      <p class="text-xs text-gray-500">Visited by {{ visit.visitedBy || 'ACCWS' }}</p>
                    </div>
                    <app-status-badge
                      [label]="visit.status | titlecase"
                      [color]="visit.status === 'completed' ? 'green' : visit.status === 'scheduled' ? 'blue' : 'gray'" />
                  </div>
                  @if (visit.notes) {
                    <p class="text-xs text-gray-600 line-clamp-2">{{ visit.notes }}</p>
                  }
                </a>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-400 text-center py-8">No site visits recorded for this system</p>
          }
        </div>
      }

      @if (activeTab() === 'data') {
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div class="px-5 py-4 border-b border-gray-200">
            <h2 class="text-base font-semibold text-gray-900">Sample Records</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">BOD</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">TSS</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ammonia</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">COD</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">pH</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (sample of samples(); track sample.id) {
                  <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/sampling', sample.id]">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ sample.date }}</td>
                    <td class="px-4 py-3">
                      <app-status-badge [label]="sample.type | titlecase" [color]="sample.type === 'effluent' ? 'blue' : sample.type === 'sludge' ? 'yellow' : 'gray'" />
                    </td>
                    <td class="px-4 py-3 text-sm text-right">{{ sample.parameters.bod ?? '-' }}</td>
                    <td class="px-4 py-3 text-sm text-right">{{ sample.parameters.tss ?? '-' }}</td>
                    <td class="px-4 py-3 text-sm text-right">{{ sample.parameters.ammonia ?? '-' }}</td>
                    <td class="px-4 py-3 text-sm text-right text-gray-600">{{ sample.parameters.cod ?? '-' }}</td>
                    <td class="px-4 py-3 text-sm text-right text-gray-600">{{ sample.parameters.ph ?? '-' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">No sample records for this system</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">System not found</p>
        <a routerLink="/systems" class="text-accent-600 text-sm mt-2 inline-block">Back to Systems</a>
      </div>
    }
  `,
})
export class SystemDetailComponent {
  private route = inject(ActivatedRoute);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  activeTab = signal<TabId>('overview');
  system = signal<WastewaterSystem | null>(null);
  visits = signal<SiteVisit[]>([]);
  samples = signal<SampleRecord[]>([]);
  loading = signal(true);
  visitsLoading = signal(false);
  error = signal<string | null>(null);

  tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'visits', label: 'Visits' },
    { id: 'data', label: 'Data' },
  ];

  hasSludgeData = computed(() => this.system()?.cells.some((c) => c.sludgeVolumeM3 != null) ?? false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId || !id) return;
      this.loading.set(true);
      this.systemService.get(id).subscribe({
        next: (sys) => {
          this.system.set(sys);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to load system.');
          this.loading.set(false);
        },
      });
      this.visitsLoading.set(true);
      this.systemService.listVisits(id).subscribe({
        next: (v) => {
          this.visits.set(v);
          this.visitsLoading.set(false);
        },
        error: () => this.visitsLoading.set(false),
      });
      this.systemService.listSamples(id).subscribe({
        next: (s) => this.samples.set(s),
        error: () => {},
      });
    });
  }

  statusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    const m: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
      healthy: 'green',
      attention: 'yellow',
      critical: 'red',
      offline: 'gray',
    };
    return m[status] ?? 'gray';
  }
}
