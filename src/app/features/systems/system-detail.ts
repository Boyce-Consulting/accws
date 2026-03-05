import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-system-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (system(); as sys) {
      <app-page-header [title]="sys.name" [subtitle]="clientName()">
        <a routerLink="/systems" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <!-- System Overview -->
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

      @if (sys.description) {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p class="text-sm text-gray-700">{{ sys.description }}</p>
        </div>
      }

      <!-- Cell Breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
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

      @if (sys.commissioned) {
        <p class="text-xs text-gray-400 mt-4">Commissioned {{ sys.commissioned }} &bull; {{ sys.province }}</p>
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
}
