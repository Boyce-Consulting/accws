import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs';
import { OrganizationService } from '../../../core/services/organization.service';
import { ReportingService } from '../../../core/services/reporting.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Organization } from '../../../core/models/organization.model';
import { DashboardSummary } from '../../../core/services/adapters';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

interface OrgSummary {
  org: Organization;
  summary: DashboardSummary | null;
  error?: string;
}

@Component({
  selector: 'app-admin-overview',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatCardComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="ACCWS Overview" subtitle="Application-wide snapshot across all organizations" />

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading overview…</p>
    } @else {
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <app-stat-card label="Organizations" [value]="totals().orgs" iconBgClass="bg-primary-100 text-primary-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </app-stat-card>
        <app-stat-card label="Total systems" [value]="totals().systems" iconBgClass="bg-accent-100 text-accent-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.976-.814L17.09 8.03c.252-.504.307-1.085.168-1.633a3.776 3.776 0 0 0-.84-1.68L12.2 0 8.065 4.134a3.78 3.78 0 0 0-.84 1.68 1.886 1.886 0 0 0 .168 1.633l2.28 3.764" />
          </svg>
        </app-stat-card>
        <app-stat-card label="Active treatments" [value]="totals().treatments" iconBgClass="bg-green-100 text-green-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </app-stat-card>
        <app-stat-card label="Open follow-ups" [value]="totals().followUps" iconBgClass="bg-amber-100 text-amber-600">
          <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </app-stat-card>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Organizations</h2>
          <a routerLink="/organizations" class="text-sm text-accent-600 hover:text-accent-700 font-medium">Manage organizations</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Organization</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Systems</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Active treatments</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Visits (30d)</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Follow-ups</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Health</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (row of summaries(); track row.org.id) {
                <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/organizations', row.org.id]">
                  <td class="px-4 py-3 text-sm">
                    <p class="font-medium text-gray-900">{{ row.org.name }}</p>
                    @if (row.org.province) { <p class="text-xs text-gray-500">{{ row.org.province }}</p> }
                  </td>
                  <td class="px-4 py-3">
                    @if (row.org.status) {
                      <app-status-badge [label]="row.org.status | titlecase"
                        [color]="row.org.status === 'active' ? 'green' : row.org.status === 'prospect' ? 'blue' : 'gray'" />
                    }
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ row.summary?.systemsTotal ?? '—' }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ row.summary?.treatmentPlansActive ?? '—' }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ row.summary?.visitsLast30Days ?? '—' }}</td>
                  <td class="px-4 py-3 text-sm text-right" [class]="(row.summary?.followUpsOpen ?? 0) > 0 ? 'text-amber-700 font-medium' : 'text-gray-400'">
                    {{ row.summary?.followUpsOpen ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-right">
                    @if (row.summary; as s) {
                      <div class="flex items-center justify-end gap-1.5">
                        @if ((s.systemsByStatus['healthy'] || 0) > 0) {
                          <span class="inline-flex items-center gap-0.5 text-xs text-green-700">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>{{ s.systemsByStatus['healthy'] }}
                          </span>
                        }
                        @if ((s.systemsByStatus['attention'] || 0) > 0) {
                          <span class="inline-flex items-center gap-0.5 text-xs text-amber-700">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{{ s.systemsByStatus['attention'] }}
                          </span>
                        }
                        @if ((s.systemsByStatus['critical'] || 0) > 0) {
                          <span class="inline-flex items-center gap-0.5 text-xs text-red-700">
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>{{ s.systemsByStatus['critical'] }}
                          </span>
                        }
                        @if ((s.systemsByStatus['offline'] || 0) > 0) {
                          <span class="inline-flex items-center gap-0.5 text-xs text-gray-600">
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{{ s.systemsByStatus['offline'] }}
                          </span>
                        }
                      </div>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">No organizations yet.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class AdminOverviewComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private reporting = inject(ReportingService);
  private auth = inject(AuthService);

  summaries = signal<OrgSummary[]>([]);
  loading = signal(true);

  totals = computed(() => {
    const rows = this.summaries();
    return rows.reduce(
      (acc, r) => {
        acc.orgs += 1;
        acc.systems += r.summary?.systemsTotal ?? 0;
        acc.treatments += r.summary?.treatmentPlansActive ?? 0;
        acc.followUps += r.summary?.followUpsOpen ?? 0;
        return acc;
      },
      { orgs: 0, systems: 0, treatments: 0, followUps: 0 },
    );
  });

  ngOnInit(): void {
    this.orgService.listAdmin().subscribe({
      next: (orgs) => this.loadSummaries(orgs),
      error: () => this.loading.set(false),
    });
  }

  private loadSummaries(orgs: Organization[]): void {
    if (orgs.length === 0) {
      this.summaries.set([]);
      this.loading.set(false);
      return;
    }
    const savedOrg = this.auth.currentOrgId();
    const calls = orgs.map((org) => {
      this.auth.setCurrentOrg(org.id);
      return this.reporting.dashboard().pipe(
        map((summary) => ({ org, summary }) satisfies OrgSummary),
        catchError(() => of({ org, summary: null, error: 'failed' } satisfies OrgSummary)),
      );
    });
    forkJoin(calls).subscribe({
      next: (rows) => {
        this.summaries.set(rows);
        this.loading.set(false);
        // Restore whatever org was active before the overview ran.
        if (savedOrg) this.auth.setCurrentOrg(savedOrg);
      },
      error: () => this.loading.set(false),
    });
  }
}
