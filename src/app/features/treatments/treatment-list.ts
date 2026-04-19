import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { TreatmentService } from '../../core/services/treatment.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { TreatmentPlan } from '../../core/models/treatment.model';
import { WastewaterSystem } from '../../core/models/system.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-treatment-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Treatment Plans" subtitle="Dosing schedules and biological treatment programs" />

    <div class="flex gap-2 mb-6">
      @for (f of filters; track f.value) {
        <button
          (click)="activeFilter.set(f.value)"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          [class]="activeFilter() === f.value ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
          {{ f.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading treatment plans…</p>
    } @else {
      <div class="space-y-4">
        @for (plan of filteredPlans(); track plan.id) {
          <a [routerLink]="['/treatments', plan.id]" class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ systemName(plan.systemId) }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ auth.currentOrg()?.name ?? '' }} &bull; {{ plan.year }}</p>
              </div>
              <app-status-badge
                [label]="plan.status | titlecase"
                [color]="plan.status === 'active' ? 'green' : plan.status === 'planned' ? 'blue' : plan.status === 'completed' ? 'gray' : 'yellow'" />
            </div>

            <div class="flex gap-0.5">
              @for (month of months; track month.num) {
                <div
                  class="flex-1 h-6 rounded text-[9px] flex items-center justify-center font-medium"
                  [class]="isActiveMonth(plan, month.num) ? 'bg-accent-100 text-accent-700' : 'bg-gray-50 text-gray-400'"
                  [title]="month.name">
                  {{ month.short }}
                </div>
              }
            </div>

            <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{{ plan.dosingSchedules.length }} dosing schedule{{ plan.dosingSchedules.length !== 1 ? 's' : '' }}</span>
            </div>
          </a>
        } @empty {
          <div class="text-center py-12 text-gray-400 text-sm">No treatment plans found</div>
        }
      </div>
    }
  `,
})
export class TreatmentListComponent {
  private treatmentService = inject(TreatmentService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  activeFilter = signal('all');
  plans = signal<TreatmentPlan[]>([]);
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);

  filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'planned', label: 'Planned' },
    { value: 'completed', label: 'Completed' },
  ];

  months = [
    { num: 1, name: 'January', short: 'J' },
    { num: 2, name: 'February', short: 'F' },
    { num: 3, name: 'March', short: 'M' },
    { num: 4, name: 'April', short: 'A' },
    { num: 5, name: 'May', short: 'M' },
    { num: 6, name: 'June', short: 'J' },
    { num: 7, name: 'July', short: 'J' },
    { num: 8, name: 'August', short: 'A' },
    { num: 9, name: 'September', short: 'S' },
    { num: 10, name: 'October', short: 'O' },
    { num: 11, name: 'November', short: 'N' },
    { num: 12, name: 'December', short: 'D' },
  ];

  filteredPlans = computed(() => {
    const filter = this.activeFilter();
    const list = this.plans();
    return filter === 'all' ? list : list.filter((p) => p.status === filter);
  });

  constructor() {
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId) {
        this.plans.set([]);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.treatmentService.list().subscribe({
        next: (list) => {
          this.plans.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.systemService.list().subscribe({
        next: (list) => this.systems.set(list),
      });
    });
  }

  systemName(id: string): string {
    return this.systems().find((s) => s.id === id)?.name ?? 'Unknown';
  }

  isActiveMonth(plan: TreatmentPlan, month: number): boolean {
    return plan.dosingSchedules.some((d) => d.months.includes(month));
  }
}
