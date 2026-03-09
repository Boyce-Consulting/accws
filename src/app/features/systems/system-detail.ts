import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { SamplingService } from '../../core/services/sampling.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

type TabId = 'overview' | 'visits' | 'data';

@Component({
  selector: 'app-system-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (system(); as sys) {
      <app-page-header [title]="sys.name" [subtitle]="clientName()">
        <a routerLink="/systems" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <!-- Tab Bar -->
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

      <!-- ======================== OVERVIEW TAB ======================== -->
      @if (activeTab() === 'overview') {
        <!-- System Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">Type</p>
            <p class="text-sm font-semibold text-gray-900 capitalize">{{ sys.type }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <app-status-badge [label]="sys.status | titlecase" [color]="sys.status === 'healthy' ? 'green' : sys.status === 'attention' ? 'yellow' : sys.status === 'critical' ? 'red' : 'gray'" />
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

        <!-- Weather Conditions Bar -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
            </svg>
            <p class="text-sm text-gray-700">
              <span class="font-medium">Current conditions:</span>
              {{ mockWeather().temp }} | Wind {{ mockWeather().wind }} | {{ mockWeather().humidity }} humidity | {{ mockWeather().conditions }}
            </p>
          </div>
        </div>

        @if (sys.description) {
          <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <p class="text-sm text-gray-700">{{ sys.description }}</p>
          </div>
        }

        <!-- Cell Breakdown -->
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
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Area (ac)</th>
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
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.areaAcres }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ cell.volumeM3.toLocaleString() }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600 text-right">
                        @if (cell.retentionTimeDays) {
                          {{ cell.retentionTimeDays }}
                          @if (cell.adjustedRetentionDays) {
                            <span class="text-xs text-gray-400">(adj. {{ cell.adjustedRetentionDays }})</span>
                          }
                        } @else {
                          <span class="text-gray-400">-</span>
                        }
                      </td>
                      @if (hasSludgeData()) {
                        <td class="px-4 py-3 text-sm text-gray-600 text-right">
                          @if (cell.sludgeVolumeM3) {
                            {{ cell.sludgeVolumeM3.toLocaleString() }}
                          } @else {
                            <span class="text-gray-400">-</span>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Recent Photos -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900">Recent Photos</h2>
            <button (click)="activeTab.set('visits')" class="text-sm text-accent-600 hover:text-accent-700 font-medium">View all in site visits</button>
          </div>
          <div class="grid grid-cols-4 gap-3">
            @for (photo of mockPhotos; track photo.label) {
              <div class="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-gray-200">
                <svg class="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <span class="text-[10px]">{{ photo.label }}</span>
              </div>
            }
          </div>
        </div>

        @if (sys.commissioned) {
          <p class="text-xs text-gray-400 mt-4">Commissioned {{ sys.commissioned }} &bull; {{ sys.province }}</p>
        }
      }

      <!-- ======================== VISITS TAB ======================== -->
      @if (activeTab() === 'visits') {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900">Site Visits</h2>
            <button class="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Log Visit
            </button>
          </div>
          @if (mockVisits().length > 0) {
            <div class="space-y-3">
              @for (visit of mockVisits(); track visit.id) {
                <a [routerLink]="['/site-visits', visit.id]"
                   class="block p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ visit.date }}</p>
                      <p class="text-xs text-gray-500">Visited by {{ visit.visitedBy }}</p>
                    </div>
                    <app-status-badge
                      [label]="visit.status | titlecase"
                      [color]="visit.status === 'completed' ? 'green' : visit.status === 'scheduled' ? 'blue' : 'gray'" />
                  </div>
                  <div class="flex flex-wrap gap-1.5 mb-2">
                    @for (act of visit.activities; track act) {
                      <span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{{ act }}</span>
                    }
                  </div>
                  @if (visit.observation) {
                    <p class="text-xs text-gray-600">{{ visit.observation }}</p>
                  }
                </a>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-400 text-center py-8">No site visits recorded for this system</p>
          }
        </div>
      }

      <!-- ======================== DATA TAB ======================== -->
      @if (activeTab() === 'data') {
        <!-- BOD & TSS Trend Chart -->
        @if (chartData().length > 0) {
          <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 class="text-sm font-semibold text-gray-900 mb-4">BOD & TSS Trends (mg/L)</h2>
            <div class="flex items-end gap-3 h-40">
              @for (item of chartData(); track item.date) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <div class="w-full flex items-end justify-center gap-1 h-32">
                    @if (item.bod != null) {
                      <div class="w-5 bg-accent-400 rounded-t transition-all" [style.height.%]="(item.bod / chartMax()) * 100"
                        [title]="'BOD: ' + item.bod + ' mg/L'"></div>
                    }
                    @if (item.tss != null) {
                      <div class="w-5 bg-primary-400 rounded-t transition-all" [style.height.%]="(item.tss / chartMax()) * 100"
                        [title]="'TSS: ' + item.tss + ' mg/L'"></div>
                    }
                  </div>
                  <span class="text-[10px] text-gray-500 whitespace-nowrap">{{ item.date }}</span>
                </div>
              }
            </div>
            <div class="flex items-center gap-4 mt-3 text-xs">
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-accent-400"></span> BOD</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-primary-400"></span> TSS</span>
            </div>
          </div>
        }

        <!-- Sample Records Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">Sample Records</h2>
            <a routerLink="/reports" class="text-sm text-accent-600 hover:text-accent-700 font-medium">View full report</a>
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
                @for (sample of systemSamples(); track sample.id) {
                  <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/sampling', sample.id]">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ sample.date }}</td>
                    <td class="px-4 py-3">
                      <app-status-badge
                        [label]="sample.type | titlecase"
                        [color]="sample.type === 'effluent' ? 'blue' : sample.type === 'sludge' ? 'yellow' : 'gray'" />
                    </td>
                    <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.bod, 25)">
                      {{ sample.parameters.bod ?? '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.tss, 25)">
                      {{ sample.parameters.tss ?? '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.ammonia, 5)">
                      {{ sample.parameters.ammonia ?? '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-600">
                      {{ sample.parameters.cod ?? '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-600">
                      {{ sample.parameters.ph ?? '-' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">No sample records for this system</td>
                  </tr>
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
  private clientService = inject(ClientService);
  private samplingService = inject(SamplingService);

  activeTab = signal<TabId>('overview');

  tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'visits', label: 'Visits' },
    { id: 'data', label: 'Data' },
  ];

  system = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.systemService.getById(id);
  });

  clientName = computed(() => {
    const sys = this.system();
    if (!sys) return '';
    return this.clientService.getById(sys.clientId)?.name ?? 'Unknown';
  });

  hasSludgeData = computed(() => {
    return this.system()?.cells.some(c => c.sludgeVolumeM3 != null) ?? false;
  });

  // Mock weather per system (deterministic based on system province/location)
  mockWeather = computed(() => {
    const sys = this.system();
    if (!sys) return { temp: '-', wind: '-', humidity: '-', conditions: '-' };
    const weatherMap: Record<string, { temp: string; wind: string; humidity: string; conditions: string }> = {
      'sys-001': { temp: '-2\u00B0C', wind: '15 km/h NW', humidity: '78%', conditions: 'Partly cloudy' },
      'sys-002': { temp: '-3\u00B0C', wind: '12 km/h W', humidity: '80%', conditions: 'Overcast' },
      'sys-003': { temp: '-4\u00B0C', wind: '18 km/h N', humidity: '72%', conditions: 'Light snow' },
      'sys-004': { temp: '-6\u00B0C', wind: '20 km/h NW', humidity: '75%', conditions: 'Overcast' },
      'sys-005': { temp: '-5\u00B0C', wind: '22 km/h N', humidity: '82%', conditions: 'Snow flurries' },
      'sys-006': { temp: '-15\u00B0C', wind: '10 km/h SE', humidity: '65%', conditions: 'Clear, extreme cold' },
      'sys-007': { temp: '0\u00B0C', wind: '14 km/h W', humidity: '70%', conditions: 'Cloudy' },
      'sys-008': { temp: '-1\u00B0C', wind: '16 km/h SW', humidity: '74%', conditions: 'Overcast' },
      'sys-009': { temp: '1\u00B0C', wind: '12 km/h W', humidity: '68%', conditions: 'Partly cloudy' },
      'sys-010': { temp: '0\u00B0C', wind: '18 km/h NW', humidity: '72%', conditions: 'Cloudy' },
      'sys-011': { temp: '-1\u00B0C', wind: '15 km/h W', humidity: '71%', conditions: 'Overcast' },
      'sys-012': { temp: '-1\u00B0C', wind: '14 km/h W', humidity: '73%', conditions: 'Overcast' },
      'sys-013': { temp: '0\u00B0C', wind: '16 km/h NW', humidity: '70%', conditions: 'Partly cloudy' },
    };
    return weatherMap[sys.id] ?? { temp: '-5\u00B0C', wind: '25 km/h NW', humidity: '85%', conditions: 'Overcast' };
  });

  mockPhotos = [
    { label: 'Feb 18, 2026' },
    { label: 'Jan 28, 2026' },
    { label: 'Oct 17, 2025' },
    { label: 'Aug 20, 2024' },
  ];

  // Mock visits for the Visits tab
  mockVisits = computed(() => {
    const sys = this.system();
    if (!sys) return [];
    const visitsMap: Record<string, { id: string; date: string; visitedBy: string; status: string; activities: string[]; observation: string }[]> = {
      'sys-001': [
        { id: 'sv-001', date: '2026-02-18', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Product application', 'Sampling'], observation: 'Applied VitaStim Polar and Polar Rx through ice. Lagoon ice cover ~90%. No visible issues at outfall.' },
        { id: 'sv-002', date: '2025-10-17', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Sampling', 'Product application'], observation: 'Fall effluent sample collected. BOD 22 mg/L within range. TSS 69 mg/L slightly elevated. Applied fall VitaStim Polar dose.' },
        { id: 'sv-003', date: '2024-08-20', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Sludge survey', 'Product application'], observation: 'Sludge survey completed. Volume at 7,637 m\u00B3 (~40% of design). Sludge Rx and VitaStim Sludge Reducer applied.' },
      ],
      'sys-005': [
        { id: 'sv-004', date: '2025-07-14', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Sampling', 'Product application'], observation: 'Summer compliance sample collected. Ammonia 12.4 mg/L above 10 mg/L guideline. Treatment plan review recommended.' },
      ],
      'sys-006': [
        { id: 'sv-005', date: '2026-01-28', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Product application', 'Flow meter reading'], observation: 'Maintenance dose of VitaStim Polar applied. System operating normally. Effluent quality stable post-recovery.' },
        { id: 'sv-006', date: '2024-02-15', visitedBy: 'Anthony Clarke', status: 'completed', activities: ['Sampling'], observation: 'Post-treatment recovery sample. BOD 18.5, TSS 22 mg/L. System returning to normal parameters.' },
      ],
      'sys-009': [
        { id: 'sv-007', date: '2026-02-03', visitedBy: 'Jacy Hingley', status: 'completed', activities: ['Product application', 'Complaint'], observation: 'H2S down to 8.6 ppm from 18.4 ppm. Bug on a Rope Sr replaced. Odor complaint resolved.' },
        { id: 'sv-008', date: '2025-09-22', visitedBy: 'Don Munro', status: 'completed', activities: ['Sampling'], observation: 'H2S spot reading at 18.4 ppm. Elevated above 10 ppm threshold. Bug on a Rope deployment recommended.' },
      ],
    };
    return visitsMap[sys.id] ?? [];
  });

  // Sampling data for the Data tab
  systemSamples = computed(() => {
    const sys = this.system();
    if (!sys) return [];
    return this.samplingService.getBySystemId(sys.id);
  });

  chartData = computed(() => {
    const samples = this.systemSamples()
      .filter(s => s.type === 'effluent' && (s.parameters.bod != null || s.parameters.tss != null))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12);
    return samples.map(s => ({
      date: s.date.slice(0, 7),
      bod: s.parameters.bod ?? null,
      tss: s.parameters.tss ?? null,
    }));
  });

  chartMax = computed(() => {
    const vals = this.chartData().flatMap(d => [d.bod, d.tss].filter((v): v is number => v != null));
    return Math.max(...vals, 1);
  });

  paramClass(value: number | undefined, threshold: number): string {
    if (value == null) return 'text-gray-400';
    return value > threshold ? 'text-red-600 font-medium' : 'text-gray-600';
  }
}
