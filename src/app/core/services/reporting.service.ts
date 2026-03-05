import { Injectable, inject, computed } from '@angular/core';
import { MockDataService, ActivityLogItem, Alert } from './mock-data.service';
import { SystemStatus } from '../models';

export interface SystemStatusCounts {
  healthy: number;
  attention: number;
  critical: number;
  offline: number;
}

export interface DashboardSummary {
  totalClients: number;
  activeClients: number;
  totalSystems: number;
  systemsByStatus: SystemStatusCounts;
  activeTreatmentPlans: number;
  openProposalValue: number;
  recentActivity: ActivityLogItem[];
  alerts: Alert[];
}

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private mock = inject(MockDataService);

  // ---------------------------------------------------------------------------
  // Scalar computed values
  // ---------------------------------------------------------------------------

  /** Total number of clients */
  readonly totalClients = computed(() => this.mock.clients().length);

  /** Number of clients with status 'active' */
  readonly activeClients = computed(
    () => this.mock.clients().filter(c => c.status === 'active').length
  );

  /** Total number of wastewater systems */
  readonly totalSystems = computed(() => this.mock.systems().length);

  /** Number of active treatment plans */
  readonly activeTreatmentPlans = computed(
    () => this.mock.treatments().filter(t => t.status === 'active').length
  );

  /** Combined value of all proposals with status 'sent' */
  readonly openProposalValue = computed(() =>
    this.mock.proposals()
      .filter(p => p.status === 'sent')
      .reduce((sum, p) => sum + p.total, 0)
  );

  // ---------------------------------------------------------------------------
  // Computed grouped values
  // ---------------------------------------------------------------------------

  /** System counts grouped by operational status */
  readonly systemsByStatus = computed<SystemStatusCounts>(() => {
    const systems = this.mock.systems();
    const counts: SystemStatusCounts = {
      healthy: 0,
      attention: 0,
      critical: 0,
      offline: 0,
    };
    for (const s of systems) {
      const key = s.status as SystemStatus;
      if (key in counts) {
        counts[key]++;
      }
    }
    return counts;
  });

  /** Systems that need attention or are critical */
  readonly systemsNeedingAttention = computed(() =>
    this.mock.systems().filter(s => s.status === 'attention' || s.status === 'critical')
  );

  /** Total population served across all systems (where populated) */
  readonly totalPopulationServed = computed(() =>
    this.mock.systems().reduce((sum, s) => sum + (s.population ?? 0), 0)
  );

  // ---------------------------------------------------------------------------
  // Activity and alerts (from MockDataService)
  // ---------------------------------------------------------------------------

  /** Recent activity log items (most recent first) */
  readonly recentActivity = computed(() =>
    [...this.mock.activityLog()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  );

  /** Current alerts, sorted by severity (danger first, then warning, then info) */
  readonly alerts = computed(() => {
    const order: Record<Alert['severity'], number> = { danger: 0, warning: 1, info: 2 };
    return [...this.mock.alerts()].sort(
      (a, b) => order[a.severity] - order[b.severity]
    );
  });

  /** Count of danger-level alerts */
  readonly dangerAlertCount = computed(
    () => this.mock.alerts().filter(a => a.severity === 'danger').length
  );

  // ---------------------------------------------------------------------------
  // Full dashboard summary — single computed for convenience
  // ---------------------------------------------------------------------------

  readonly dashboardSummary = computed<DashboardSummary>(() => ({
    totalClients: this.totalClients(),
    activeClients: this.activeClients(),
    totalSystems: this.totalSystems(),
    systemsByStatus: this.systemsByStatus(),
    activeTreatmentPlans: this.activeTreatmentPlans(),
    openProposalValue: this.openProposalValue(),
    recentActivity: this.recentActivity().slice(0, 5),
    alerts: this.alerts(),
  }));
}
