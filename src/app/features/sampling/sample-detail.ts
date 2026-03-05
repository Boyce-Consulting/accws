import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SamplingService } from '../../core/services/sampling.service';
import { SystemService } from '../../core/services/system.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-sample-detail',
  imports: [RouterLink, PageHeaderComponent],
  template: `
    @if (sample(); as s) {
      <app-page-header [title]="'Sample Record - ' + s.date" [subtitle]="systemName()">
        <a routerLink="/sampling" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Effluent Parameters -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Effluent Parameters</h2>
          <div class="grid grid-cols-2 gap-4">
            @for (param of paramList(); track param.label) {
              <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500 mb-0.5">{{ param.label }}</p>
                <p class="text-lg font-semibold" [class]="param.alert ? 'text-red-600' : 'text-gray-900'">
                  {{ param.value ?? 'N/A' }}
                </p>
                @if (param.unit) {
                  <p class="text-xs text-gray-400">{{ param.unit }}</p>
                }
              </div>
            }
          </div>
        </div>

        <!-- Metadata -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Details</h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500">Sample Type</dt>
                <dd class="text-sm text-gray-900 capitalize">{{ s.type }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Date</dt>
                <dd class="text-sm text-gray-900">{{ s.date }}</dd>
              </div>
              @if (s.collectedBy) {
                <div>
                  <dt class="text-xs font-medium text-gray-500">Collected By</dt>
                  <dd class="text-sm text-gray-900">{{ s.collectedBy }}</dd>
                </div>
              }
              @if (s.notes) {
                <div>
                  <dt class="text-xs font-medium text-gray-500">Notes</dt>
                  <dd class="text-sm text-gray-700">{{ s.notes }}</dd>
                </div>
              }
            </dl>
          </div>

          @if (s.sludgeSurvey; as ss) {
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h2 class="text-base font-semibold text-gray-900 mb-4">Sludge Survey</h2>
              <dl class="space-y-3">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Cell</dt>
                  <dd class="text-sm text-gray-900">{{ ss.cellName }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Volume</dt>
                  <dd class="text-sm text-gray-900">{{ ss.volumeM3.toLocaleString() }} m&sup3;</dd>
                </div>
                @if (ss.totalSolidsPct != null) {
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Total Solids</dt>
                    <dd class="text-sm text-gray-900">{{ ss.totalSolidsPct }}%</dd>
                  </div>
                }
                @if (ss.volatileSolidsPct != null) {
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Volatile Solids</dt>
                    <dd class="text-sm text-gray-900">{{ ss.volatileSolidsPct }}%</dd>
                  </div>
                }
                @if (ss.specificGravity != null) {
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Specific Gravity</dt>
                    <dd class="text-sm text-gray-900">{{ ss.specificGravity }} g/mL</dd>
                  </div>
                }
              </dl>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Sample not found</p>
        <a routerLink="/sampling" class="text-accent-600 text-sm mt-2 inline-block">Back to Sampling</a>
      </div>
    }
  `,
})
export class SampleDetailComponent {
  private route = inject(ActivatedRoute);
  private samplingService = inject(SamplingService);
  private systemService = inject(SystemService);

  sample = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.samplingService.getById(id);
  });

  systemName = computed(() => {
    const s = this.sample();
    if (!s) return '';
    return this.systemService.getById(s.systemId)?.name ?? 'Unknown System';
  });

  paramList = computed(() => {
    const p = this.sample()?.parameters;
    if (!p) return [];
    return [
      { label: 'BOD', value: p.bod, unit: 'mg/L', alert: (p.bod ?? 0) > 25 },
      { label: 'TSS', value: p.tss, unit: 'mg/L', alert: (p.tss ?? 0) > 25 },
      { label: 'Ammonia', value: p.ammonia, unit: 'mg/L', alert: (p.ammonia ?? 0) > 5 },
      { label: 'Phosphorus', value: p.phosphorus, unit: 'mg/L', alert: false },
      { label: 'COD', value: p.cod, unit: 'mg/L', alert: false },
      { label: 'pH', value: p.ph, unit: '', alert: false },
      { label: 'Dissolved Oxygen', value: p.dissolvedOxygen, unit: 'mg/L', alert: false },
      { label: 'H2S', value: p.h2s, unit: 'ppm', alert: (p.h2s ?? 0) > 10 },
    ];
  });
}
