import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ReportingService } from '../../core/services/reporting.service';
import { TreatmentService } from '../../core/services/treatment.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, StatCardComponent, PageHeaderComponent, StatusBadgeComponent, TitleCasePipe],
  template: `
    <app-page-header [title]="greeting()" subtitle="Here's what's happening with your systems." />

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @if (auth.isAdmin()) {
        <app-stat-card label="Total Clients" [value]="reporting.totalClients()" iconBgClass="bg-primary-100 text-primary-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </app-stat-card>
      }
      <app-stat-card label="Active Systems" [value]="reporting.totalSystems()" iconBgClass="bg-accent-100 text-accent-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        </svg>
      </app-stat-card>
      <app-stat-card label="Active Treatments" [value]="reporting.activeTreatmentPlans()" iconBgClass="bg-green-100 text-green-600">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </app-stat-card>
      @if (auth.isAdmin()) {
        <app-stat-card label="Pipeline Value" [value]="'$' + reporting.openProposalValue().toLocaleString()" iconBgClass="bg-amber-100 text-amber-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </app-stat-card>
      }
    </div>

    <!-- Upcoming Tasks (client users only) -->
    @if (!auth.isAdmin()) {
      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">What's Coming Up</h2>
          <a routerLink="/treatments" class="text-sm text-accent-600 hover:text-accent-700 font-medium">View all</a>
        </div>
        @if (upcomingTasks().length > 0) {
          <div class="space-y-2">
            @for (task of upcomingTasks(); track task.planId + task.zone) {
              <a [routerLink]="['/treatments', task.planId]"
                 class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ task.systemName }} &mdash; {{ task.zone }}</p>
                    <p class="text-xs text-gray-500">{{ task.productName }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0 ml-4">
                  <p class="text-sm font-medium text-gray-700">{{ task.quantityLbs }} lbs</p>
                  <p class="text-xs text-gray-500">{{ task.frequency }}</p>
                </div>
              </a>
            }
          </div>
        } @else {
          <p class="text-sm text-gray-400 text-center py-4">No upcoming treatments this month</p>
        }
      </div>
    }

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- System Health Overview -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">System Health</h2>
          <a routerLink="/systems" class="text-sm text-accent-600 hover:text-accent-700 font-medium">View all</a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">{{ reporting.systemsByStatus().healthy }}</p>
            <p class="text-xs text-green-700 font-medium mt-1">Healthy</p>
          </div>
          <div class="text-center p-3 bg-amber-50 rounded-lg">
            <p class="text-2xl font-bold text-amber-600">{{ reporting.systemsByStatus().attention }}</p>
            <p class="text-xs text-amber-700 font-medium mt-1">Attention</p>
          </div>
          <div class="text-center p-3 bg-red-50 rounded-lg">
            <p class="text-2xl font-bold text-red-600">{{ reporting.systemsByStatus().critical }}</p>
            <p class="text-xs text-red-700 font-medium mt-1">Critical</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-500">{{ reporting.systemsByStatus().offline }}</p>
            <p class="text-xs text-gray-600 font-medium mt-1">Offline</p>
          </div>
        </div>
        <!-- System list -->
        <div class="space-y-2">
          @for (sys of systems(); track sys.id) {
            <a [routerLink]="['/systems', sys.id]" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full" [class]="statusDotClass(sys.status)"></div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ sys.name }}</p>
                  <p class="text-xs text-gray-500">{{ sys.type | titlecase }} &bull; {{ sys.province }}</p>
                </div>
              </div>
              <app-status-badge [label]="sys.status | titlecase" [color]="statusColor(sys.status)" />
            </a>
          }
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Alerts -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Alerts</h2>
          <div class="space-y-3">
            @for (alert of reporting.alerts(); track alert.id) {
              <div class="flex items-start gap-3 p-3 rounded-lg" [class]="alertBgClass(alert.severity)">
                @if (alert.severity === 'danger') {
                  <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                } @else if (alert.severity === 'warning') {
                  <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                } @else {
                  <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                }
                <div>
                  <p class="text-sm text-gray-800">{{ alert.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ alert.date }}</p>
                </div>
              </div>
            }
            @empty {
              <p class="text-sm text-gray-400 text-center py-4">No alerts</p>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div class="space-y-4">
            @for (item of reporting.recentActivity(); track item.id) {
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" [class]="activityIconClass(item.type)">
                  @switch (item.type) {
                    @case ('sample') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5" />
                      </svg>
                    }
                    @case ('treatment') {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    }
                    @default {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    }
                  }
                </div>
                <div>
                  <p class="text-sm text-gray-800">{{ item.message }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ item.timestamp }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService);
  reporting = inject(ReportingService);
  private systemService = inject(SystemService);
  private treatmentService = inject(TreatmentService);

  systems = computed(() => this.systemService.systems().slice(0, 8));

  upcomingTasks = computed(() => {
    const clientId = this.auth.currentUser()?.clientId;
    if (!clientId) return [];
    const currentMonth = new Date().getMonth() + 1;
    const tasks: {
      systemName: string;
      zone: string;
      productName: string;
      quantityLbs: number;
      frequency: string;
      planId: string;
    }[] = [];
    const activePlans = this.treatmentService.treatments().filter(
      p => p.clientId === clientId && p.status === 'active'
    );
    for (const plan of activePlans) {
      for (const schedule of plan.dosingSchedules) {
        if (schedule.months.includes(currentMonth)) {
          const system = this.systemService.getById(plan.systemId);
          tasks.push({
            systemName: system?.name ?? plan.systemId,
            zone: schedule.zone,
            productName: schedule.productName,
            quantityLbs: schedule.quantityLbs,
            frequency: schedule.frequency,
            planId: plan.id,
          });
        }
        if (tasks.length >= 6) break;
      }
      if (tasks.length >= 6) break;
    }
    return tasks;
  });

  greeting = computed(() => {
    const name = this.auth.currentUser()?.name?.split(' ')[0] ?? '';
    return `Welcome back, ${name}`;
  });

  statusDotClass(status: string): string {
    const map: Record<string, string> = {
      healthy: 'bg-green-500',
      attention: 'bg-amber-500',
      critical: 'bg-red-500',
      offline: 'bg-gray-400',
    };
    return map[status] ?? 'bg-gray-400';
  }

  statusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    const map: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
      healthy: 'green',
      attention: 'yellow',
      critical: 'red',
      offline: 'gray',
    };
    return map[status] ?? 'gray';
  }

  alertBgClass(severity: string): string {
    const map: Record<string, string> = {
      danger: 'bg-red-50',
      warning: 'bg-amber-50',
      info: 'bg-blue-50',
    };
    return map[severity] ?? 'bg-gray-50';
  }

  activityIconClass(type: string): string {
    const map: Record<string, string> = {
      sample: 'bg-blue-100 text-blue-600',
      treatment: 'bg-green-100 text-green-600',
      proposal: 'bg-amber-100 text-amber-600',
      system: 'bg-purple-100 text-purple-600',
      client: 'bg-primary-100 text-primary-600',
    };
    return map[type] ?? 'bg-gray-100 text-gray-600';
  }
}
