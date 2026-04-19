import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { SamplingService } from '../../core/services/sampling.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { SampleRecord } from '../../core/models/sampling.model';
import { WastewaterSystem } from '../../core/models/system.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-sample-list',
  imports: [RouterLink, TitleCasePipe, DatePipe, DecimalPipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Sampling & Monitoring" subtitle="Effluent quality and sludge survey records" />

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading samples…</p>
    } @else {
      @if (chartData().length > 0) {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 class="text-sm font-semibold text-gray-900 mb-4">BOD & TSS Trends (mg/L)</h2>
          <div class="flex items-end gap-3 h-40">
            @for (item of chartData(); track item.date) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full flex items-end justify-center gap-1 h-32">
                  @if (item.bod != null) {
                    <div class="w-5 bg-accent-400 rounded-t" [style.height.%]="(item.bod / maxValue()) * 100" [title]="'BOD: ' + item.bod + ' mg/L'"></div>
                  }
                  @if (item.tss != null) {
                    <div class="w-5 bg-primary-400 rounded-t" [style.height.%]="(item.tss / maxValue()) * 100" [title]="'TSS: ' + item.tss + ' mg/L'"></div>
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

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">System</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">BOD</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">TSS</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ammonia</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">COD</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">pH</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (sample of sortedSamples(); track sample.id) {
                <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/sampling', sample.id]">
                  <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ sample.date | date:'mediumDate' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ systemName(sample.systemId) }}</td>
                  <td class="px-4 py-3">
                    <app-status-badge [label]="sample.type | titlecase" [color]="sample.type === 'effluent' ? 'blue' : sample.type === 'sludge' ? 'yellow' : 'gray'" />
                  </td>
                  <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.bod, 25)">{{ (sample.parameters.bod | number:'1.0-2') ?? '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.tss, 25)">{{ (sample.parameters.tss | number:'1.0-2') ?? '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right" [class]="paramClass(sample.parameters.ammonia, 5)">{{ (sample.parameters.ammonia | number:'1.0-2') ?? '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-600">{{ (sample.parameters.cod | number:'1.0-2') ?? '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-600">{{ (sample.parameters.ph | number:'1.1-2') ?? '-' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">No sample records found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class SampleListComponent {
  private samplingService = inject(SamplingService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  samples = signal<SampleRecord[]>([]);
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);

  sortedSamples = computed(() =>
    [...this.samples()].sort((a, b) => b.date.localeCompare(a.date)),
  );

  chartData = computed(() => {
    const effluent = this.sortedSamples()
      .filter((s) => s.type === 'effluent' && (s.parameters.bod != null || s.parameters.tss != null))
      .slice(0, 8)
      .reverse();
    return effluent.map((s) => ({
      date: new Date(s.date).toLocaleDateString('en-CA', { month: 'short', year: '2-digit' }),
      bod: s.parameters.bod ?? null,
      tss: s.parameters.tss ?? null,
    }));
  });

  maxValue = computed(() => {
    const vals = this.chartData().flatMap((d) => [d.bod, d.tss].filter((v): v is number => v != null));
    return Math.max(...vals, 1);
  });

  systemName(id: string): string {
    return this.systems().find((s) => s.id === id)?.name ?? 'Unknown';
  }

  paramClass(value: number | undefined, threshold: number): string {
    if (value == null) return 'text-gray-400';
    return value > threshold ? 'text-red-600 font-medium' : 'text-gray-600';
  }

  constructor() {
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId) {
        this.samples.set([]);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.samplingService.list().subscribe({
        next: (list) => {
          this.samples.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.systemService.list().subscribe({ next: (s) => this.systems.set(s) });
    });
  }
}
