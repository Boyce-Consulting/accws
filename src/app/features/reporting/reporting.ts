import { Component, inject, computed } from '@angular/core';
import { ReportingService } from '../../core/services/reporting.service';
import { SamplingService } from '../../core/services/sampling.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-reporting',
  imports: [PageHeaderComponent, StatCardComponent],
  template: `
    <app-page-header title="Reports" subtitle="Performance metrics and effluent trending" />

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Systems Monitored" [value]="reporting.totalSystems()" iconBgClass="bg-accent-100 text-accent-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281" />
        </svg>
      </app-stat-card>
      <app-stat-card label="Population Served" [value]="reporting.totalPopulationServed().toLocaleString()" iconBgClass="bg-primary-100 text-primary-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372" />
        </svg>
      </app-stat-card>
      <app-stat-card label="Active Treatments" [value]="reporting.activeTreatmentPlans()" iconBgClass="bg-green-100 text-green-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </app-stat-card>
      <app-stat-card label="Sample Records" [value]="totalSamples()" iconBgClass="bg-blue-100 text-blue-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5" />
        </svg>
      </app-stat-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Effluent Trend Chart -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Effluent Quality Trends</h2>
        @if (trendData().length > 0) {
          <div class="space-y-3">
            @for (item of trendData(); track item.date) {
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600">{{ item.date }}</span>
                  <span class="text-xs text-gray-500">BOD: {{ item.bod ?? 'N/A' }} | TSS: {{ item.tss ?? 'N/A' }} mg/L</span>
                </div>
                <div class="flex gap-1 h-4">
                  @if (item.bod != null) {
                    <div class="bg-accent-400 rounded h-full transition-all" [style.width.%]="(item.bod / trendMax()) * 50" [title]="'BOD: ' + item.bod"></div>
                  }
                  @if (item.tss != null) {
                    <div class="bg-primary-400 rounded h-full transition-all" [style.width.%]="(item.tss / trendMax()) * 50" [title]="'TSS: ' + item.tss"></div>
                  }
                </div>
              </div>
            }
          </div>
          <div class="flex items-center gap-4 mt-4 text-xs">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-accent-400"></span> BOD</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-primary-400"></span> TSS</span>
          </div>
        } @else {
          <p class="text-sm text-gray-400 text-center py-8">No effluent data available</p>
        }
      </div>

      <!-- System Health Distribution -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-base font-semibold text-gray-900 mb-4">System Health Distribution</h2>
        <div class="space-y-4">
          @for (item of healthBars(); track item.label) {
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                <span class="text-sm font-semibold text-gray-900">{{ item.count }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3">
                <div class="h-3 rounded-full transition-all" [class]="item.barClass" [style.width.%]="item.pct"></div>
              </div>
            </div>
          }
        </div>

        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-700">
            <span class="font-semibold">{{ reporting.totalSystems() }}</span> total systems across
            <span class="font-semibold">{{ reporting.totalClients() }}</span> clients serving
            <span class="font-semibold">{{ reporting.totalPopulationServed().toLocaleString() }}</span> people.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ReportingComponent {
  reporting = inject(ReportingService);
  private samplingService = inject(SamplingService);
  private auth = inject(AuthService);

  totalSamples = computed(() => this.samplingService.samples().length);

  trendData = computed(() => {
    const samples = this.samplingService.samples()
      .filter(s => s.type === 'effluent' && (s.parameters.bod != null || s.parameters.tss != null))
      .sort((a, b) => a.date.localeCompare(b.date));
    return samples.map(s => ({
      date: s.date,
      bod: s.parameters.bod ?? null,
      tss: s.parameters.tss ?? null,
    }));
  });

  trendMax = computed(() => {
    const vals = this.trendData().flatMap(d => [d.bod, d.tss].filter((v): v is number => v != null));
    return Math.max(...vals, 1);
  });

  healthBars = computed(() => {
    const s = this.reporting.systemsByStatus();
    const total = this.reporting.totalSystems() || 1;
    return [
      { label: 'Healthy', count: s.healthy, pct: (s.healthy / total) * 100, barClass: 'bg-green-500' },
      { label: 'Attention', count: s.attention, pct: (s.attention / total) * 100, barClass: 'bg-amber-500' },
      { label: 'Critical', count: s.critical, pct: (s.critical / total) * 100, barClass: 'bg-red-500' },
      { label: 'Offline', count: s.offline, pct: (s.offline / total) * 100, barClass: 'bg-gray-400' },
    ];
  });
}
