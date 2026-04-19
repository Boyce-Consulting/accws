import { Component, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { TreatmentService } from '../../core/services/treatment.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { DosingSchedule, TreatmentPlan } from '../../core/models/treatment.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-treatment-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading treatment plan…</p>
    } @else if (plan(); as p) {
      <app-page-header [title]="systemName() + ' - ' + p.year" [subtitle]="auth.currentOrg()?.name ?? ''">
        <a routerLink="/treatments" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="flex items-center gap-4 mb-6">
        <app-status-badge
          [label]="p.status | titlecase"
          [color]="p.status === 'active' ? 'green' : p.status === 'planned' ? 'blue' : p.status === 'completed' ? 'gray' : 'yellow'" />
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold text-gray-900">Dosing Calendar</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50">Zone</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty (lbs)</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Frequency</th>
                @for (m of monthHeaders; track m) {
                  <th class="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-8">{{ m }}</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (sched of p.dosingSchedules; track sched.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">{{ sched.zone }}</td>
                  <td class="px-4 py-3 text-sm text-accent-600 font-medium">
                    <a [routerLink]="['/products', sched.productId]" class="text-accent-600 hover:text-accent-700 hover:underline">{{ sched.productName }}</a>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ sched.quantityLbs }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ sched.frequency }}</td>
                  @for (m of monthNums; track m) {
                    <td class="px-2 py-3 text-center">
                      <span class="inline-block w-4 h-4 rounded-full" [class]="sched.months.includes(m) ? 'bg-accent-500' : 'bg-gray-100'"></span>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (zone of zones(); track zone) {
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ zone }}</h3>
            <div class="space-y-2">
              @for (sched of schedulesByZone(zone); track sched.id) {
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <a [routerLink]="['/products', sched.productId]" class="text-sm font-medium text-accent-600 hover:text-accent-700 hover:underline">{{ sched.productName }}</a>
                    <p class="text-xs text-gray-500">{{ sched.quantityLbs }} lbs &bull; {{ sched.frequency }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Treatment plan not found</p>
        <a routerLink="/treatments" class="text-accent-600 text-sm mt-2 inline-block">Back to Treatments</a>
      </div>
    }
  `,
})
export class TreatmentDetailComponent {
  private route = inject(ActivatedRoute);
  private treatmentService = inject(TreatmentService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  monthHeaders = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  monthNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  plan = signal<TreatmentPlan | null>(null);
  loading = signal(true);
  systemNameById = signal<Map<string, string>>(new Map());

  zones = computed(() => {
    const p = this.plan();
    if (!p) return [];
    return [...new Set(p.dosingSchedules.map((d) => d.zone))];
  });

  systemName = computed(() => {
    const p = this.plan();
    return p ? this.systemNameById().get(p.systemId) ?? 'Unknown' : '';
  });

  schedulesByZone(zone: string): DosingSchedule[] {
    return this.plan()?.dosingSchedules.filter((d) => d.zone === zone) ?? [];
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId || !id) return;
      this.loading.set(true);
      this.treatmentService.get(id).subscribe({
        next: (p) => {
          this.plan.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.systemService.list().subscribe({
        next: (list) => this.systemNameById.set(new Map(list.map((s) => [s.id, s.name]))),
      });
    });
  }
}
