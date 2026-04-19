import { Component, inject, computed, signal, effect } from '@angular/core';
import { ReportingService } from '../../core/services/reporting.service';
import { SamplingService } from '../../core/services/sampling.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { SampleRecord } from '../../core/models/sampling.model';
import { WastewaterSystem } from '../../core/models/system.model';
import { DashboardSummary } from '../../core/services/adapters';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-reporting',
  imports: [PageHeaderComponent, StatCardComponent],
  template: `
    <app-page-header title="Reports" subtitle="Performance metrics and effluent trending" />

    @if (!auth.currentOrgId()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
        Select an organization to view reports.
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex items-center gap-3">
          <label for="system-filter" class="text-sm font-medium text-gray-700 shrink-0">Filter by System</label>
          <select id="system-filter"
            class="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-accent-500 focus:ring-accent-500"
            [value]="selectedSystemId()"
            (change)="onSystemFilterChange($event)">
            <option value="">All Systems</option>
            @for (sys of systems(); track sys.id) {
              <option [value]="sys.id">{{ sys.name }}</option>
            }
          </select>
          @if (selectedSystemId()) {
            <button (click)="selectedSystemId.set('')" class="text-xs text-gray-500 hover:text-gray-700 underline">Clear</button>
          }
        </div>
      </div>

      @if (summary(); as s) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <app-stat-card label="Systems" [value]="s.systemsTotal" iconBgClass="bg-accent-100 text-accent-600">
            <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94"/></svg>
          </app-stat-card>
          <app-stat-card label="Active Treatments" [value]="s.treatmentPlansActive" iconBgClass="bg-green-100 text-green-600">
            <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5"/></svg>
          </app-stat-card>
          <app-stat-card label="Visits (30d)" [value]="s.visitsLast30Days" iconBgClass="bg-primary-100 text-primary-600">
            <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
          </app-stat-card>
          <app-stat-card label="Samples (30d)" [value]="s.samplesLast30Days" iconBgClass="bg-blue-100 text-blue-600">
            <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714"/></svg>
          </app-stat-card>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-900 mb-1">Effluent Quality Trends</h2>
          <p class="text-xs text-gray-500 mb-4">{{ selectedSystemId() ? selectedSystemName() : 'All systems' }}</p>
          @if (trendData().length > 0) {
            <div class="space-y-3">
              @for (item of trendData(); track item.date) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-600">{{ item.date }}</span>
                    <span class="text-xs text-gray-500">BOD: {{ item.bod ?? 'N/A' }} | TSS: {{ item.tss ?? 'N/A' }} mg/L</span>
                  </div>
                  <div class="flex gap-1 h-4">
                    @if (item.bod != null) { <div class="bg-accent-400 rounded" [style.width.%]="(item.bod / trendMax()) * 50"></div> }
                    @if (item.tss != null) { <div class="bg-primary-400 rounded" [style.width.%]="(item.tss / trendMax()) * 50"></div> }
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-400 text-center py-8">No effluent data available</p>
          }
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-900 mb-4">System Health</h2>
          @if (summary(); as s) {
            <div class="space-y-3">
              @for (label of ['healthy','attention','critical','offline']; track label) {
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 capitalize">{{ label }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ s.systemsByStatus[label] || 0 }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-3">
                    <div class="h-3 rounded-full transition-all" [class]="barClass(label)" [style.width.%]="pct(s.systemsByStatus[label] || 0, s.systemsTotal)"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ReportingComponent {
  private reporting = inject(ReportingService);
  private samplingService = inject(SamplingService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  selectedSystemId = signal('');
  summary = signal<DashboardSummary | null>(null);
  samples = signal<SampleRecord[]>([]);
  systems = signal<WastewaterSystem[]>([]);

  selectedSystemName = computed(
    () => this.systems().find((s) => s.id === this.selectedSystemId())?.name ?? '',
  );

  onSystemFilterChange(e: Event): void {
    this.selectedSystemId.set((e.target as HTMLSelectElement).value);
  }

  trendData = computed(() => {
    const id = this.selectedSystemId();
    let samples = this.samples().filter(
      (s) => s.type === 'effluent' && (s.parameters.bod != null || s.parameters.tss != null),
    );
    if (id) samples = samples.filter((s) => s.systemId === id);
    samples = samples.sort((a, b) => a.date.localeCompare(b.date));
    return samples.map((s) => ({
      date: new Date(s.date).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' }),
      bod: s.parameters.bod ?? null,
      tss: s.parameters.tss ?? null,
    }));
  });

  trendMax = computed(() => {
    const vals = this.trendData().flatMap((d) => [d.bod, d.tss].filter((v): v is number => v != null));
    return Math.max(...vals, 1);
  });

  pct(n: number, total: number): number {
    return total > 0 ? (n / total) * 100 : 0;
  }

  barClass(label: string): string {
    const m: Record<string, string> = {
      healthy: 'bg-green-500',
      attention: 'bg-amber-500',
      critical: 'bg-red-500',
      offline: 'bg-gray-400',
    };
    return m[label] ?? 'bg-gray-400';
  }

  constructor() {
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId) {
        this.summary.set(null);
        this.samples.set([]);
        this.systems.set([]);
        return;
      }
      this.reporting.dashboard().subscribe({ next: (s) => this.summary.set(s) });
      this.samplingService.list().subscribe({ next: (s) => this.samples.set(s) });
      this.systemService.list().subscribe({ next: (s) => this.systems.set(s) });
    });
  }
}
