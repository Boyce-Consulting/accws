import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { SiteVisitService } from '../../core/services/site-visit.service';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import {
  VisitStatus,
  LiftStationObservation,
  LagoonObservation,
  WWTPObservation,
} from '../../core/models/site-visit.model';

@Component({
  selector: 'app-site-visit-detail',
  imports: [RouterLink, NgTemplateOutlet, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (visit(); as v) {
      <app-page-header [title]="systemName() + ' — ' + v.visitDate" [subtitle]="clientName()">
        <a routerLink="/site-visits" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Site Visits</a>
      </app-page-header>

      <!-- Status & Visited By -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <app-status-badge
          [label]="formatStatus(v.status)"
          [color]="statusColor(v.status)" />
        <span class="text-sm text-gray-600">
          Visited by <span class="font-medium text-gray-900">{{ v.visitedBy }}</span>
        </span>
      </div>

      <!-- Weather Conditions Bar -->
      @if (v.weather; as w) {
        <div class="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-lg px-4 py-2.5 mb-6 flex items-center gap-2 text-sm text-[#1e3a5f] overflow-x-auto">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
          <span class="font-medium shrink-0">Conditions:</span>
          <span class="whitespace-nowrap">{{ w.temperatureC }}&deg;C</span>
          <span class="opacity-40">|</span>
          <span class="whitespace-nowrap">Wind {{ w.windSpeedKmh }}km/h{{ w.windDirection ? ' ' + w.windDirection : '' }}</span>
          <span class="opacity-40">|</span>
          <span class="whitespace-nowrap">{{ w.humidityPct }}% humidity</span>
          <span class="opacity-40">|</span>
          <span class="whitespace-nowrap">{{ w.conditions }}</span>
        </div>
      }

      <!-- Activities Section -->
      @if (v.activities && v.activities.length > 0) {
        <div class="mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-3">Activities</h2>
          <div class="flex flex-wrap gap-2">
            @for (activity of v.activities; track activity.type) {
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                {{ formatActivityType(activity.type) }}
              </span>
            }
          </div>
        </div>
      }

      <!-- Observations Section -->
      @if (v.observation; as obs) {
        <div class="mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Observations</h2>

          <!-- ===== Lift Station ===== -->
          @if (obs.systemType === 'lift-station') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <!-- FOG Card -->
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">FOG (Fats, Oils &amp; Grease)</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Status</dt>
                    <dd class="text-sm font-medium" [class]="asLiftStation(obs).fogPresent ? 'text-amber-600' : 'text-green-600'">
                      {{ asLiftStation(obs).fogPresent ? 'Present' : 'Not Present' }}
                    </dd>
                  </div>
                  @if (asLiftStation(obs).fogAppearance && asLiftStation(obs).fogAppearance!.length > 0) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500 mb-1">Appearance</dt>
                      <dd class="flex flex-wrap gap-1.5">
                        @for (tag of asLiftStation(obs).fogAppearance!; track tag) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {{ formatTag(tag) }}
                          </span>
                        }
                      </dd>
                    </div>
                  }
                  @if (asLiftStation(obs).fogSurfaceCoveragePct != null) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Surface Coverage</dt>
                      <dd class="text-sm text-gray-900">{{ asLiftStation(obs).fogSurfaceCoveragePct }}%</dd>
                    </div>
                  }
                </dl>
              </div>

              <!-- Odour Card -->
              @if (asLiftStation(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <dl class="space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Intensity</dt>
                      <dd class="text-sm text-gray-900">
                        <span class="font-semibold">{{ odour.intensity }}</span><span class="text-gray-400">/5</span>
                        <span class="ml-1.5 text-gray-500">({{ odourLabel(odour.intensity) }})</span>
                      </dd>
                    </div>
                    @if (odour.nature.length > 0) {
                      <div>
                        <dt class="text-xs font-medium text-gray-500 mb-1">Nature</dt>
                        <dd class="flex flex-wrap gap-1.5">
                          @for (tag of odour.nature; track tag) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {{ formatTag(tag) }}
                            </span>
                          }
                        </dd>
                      </div>
                    }
                  </dl>
                </div>
              }

              <!-- Readings Card -->
              @if (asLiftStation(obs).flowMeterReading != null || asLiftStation(obs).h2sReading != null) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Readings</h3>
                  <div class="grid grid-cols-2 gap-4">
                    @if (asLiftStation(obs).flowMeterReading != null) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <p class="text-xs text-gray-500 mb-0.5">Flow Meter</p>
                        <p class="text-lg font-semibold text-gray-900">{{ asLiftStation(obs).flowMeterReading }}</p>
                        <p class="text-xs text-gray-400">m&sup3;/day</p>
                      </div>
                    }
                    @if (asLiftStation(obs).h2sReading != null) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <p class="text-xs text-gray-500 mb-0.5">H&#8322;S Sensor</p>
                        <p class="text-lg font-semibold" [class]="asLiftStation(obs).h2sReading! > 10 ? 'text-red-600' : 'text-gray-900'">
                          {{ asLiftStation(obs).h2sReading }}
                        </p>
                        <p class="text-xs text-gray-400">ppm</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Product Applications Table -->
            @if (asLiftStation(obs).productApplications.length > 0) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asLiftStation(obs).productApplications }" />
            }
          }

          <!-- ===== Lagoon ===== -->
          @if (obs.systemType === 'lagoon') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <!-- Water Quality Card -->
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Water Quality</h3>
                <dl class="space-y-3">
                  @if (asLagoon(obs).waterColour && asLagoon(obs).waterColour!.length > 0) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500 mb-1">Colour</dt>
                      <dd class="flex flex-wrap gap-1.5">
                        @for (tag of asLagoon(obs).waterColour!; track tag) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {{ formatTag(tag) }}
                          </span>
                        }
                      </dd>
                    </div>
                  }
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Sludge</dt>
                    <dd class="text-sm font-medium" [class]="asLagoon(obs).sludgePresent ? 'text-amber-600' : 'text-green-600'">
                      {{ asLagoon(obs).sludgePresent ? 'Present' : 'Absent' }}
                    </dd>
                  </div>
                  @if (asLagoon(obs).sludgeSurfaceCoveragePct != null) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Sludge Coverage</dt>
                      <dd class="text-sm text-gray-900">{{ asLagoon(obs).sludgeSurfaceCoveragePct }}%</dd>
                    </div>
                  }
                </dl>
              </div>

              <!-- Vegetation Card -->
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Vegetation</h3>
                <dl class="space-y-3">
                  @if (asLagoon(obs).algaeType && asLagoon(obs).algaeType!.length > 0) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500 mb-1">Algae Type</dt>
                      <dd class="flex flex-wrap gap-1.5">
                        @for (tag of asLagoon(obs).algaeType!; track tag) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            {{ formatTag(tag) }}
                          </span>
                        }
                      </dd>
                    </div>
                  } @else {
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Algae</dt>
                      <dd class="text-sm text-gray-900">{{ asLagoon(obs).algaePresent ? 'Present' : 'Not present' }}</dd>
                    </div>
                  }
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Cattail Severity</dt>
                    <dd class="text-sm text-gray-900 capitalize">{{ asLagoon(obs).cattailSeverity }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Odour Card -->
              @if (asLagoon(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <dl class="space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Intensity</dt>
                      <dd class="text-sm text-gray-900">
                        <span class="font-semibold">{{ odour.intensity }}</span><span class="text-gray-400">/5</span>
                        <span class="ml-1.5 text-gray-500">({{ odourLabel(odour.intensity) }})</span>
                      </dd>
                    </div>
                    @if (odour.nature.length > 0) {
                      <div>
                        <dt class="text-xs font-medium text-gray-500 mb-1">Nature</dt>
                        <dd class="flex flex-wrap gap-1.5">
                          @for (tag of odour.nature; track tag) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {{ formatTag(tag) }}
                            </span>
                          }
                        </dd>
                      </div>
                    }
                  </dl>
                </div>
              }
            </div>

            <!-- Product Applications Table -->
            @if (asLagoon(obs).productApplications.length > 0) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asLagoon(obs).productApplications }" />
            }
          }

          <!-- ===== WWTP ===== -->
          @if (obs.systemType === 'wwtp') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <!-- Effluent Card -->
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Effluent</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Clarity</dt>
                    <dd class="flex items-center gap-2">
                      <span class="inline-block w-3 h-3 rounded-full" [class]="clarityDotClass(asWWTP(obs).effluentClarity)"></span>
                      <span class="text-sm font-medium text-gray-900">{{ formatTag(asWWTP(obs).effluentClarity) }}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- Odour Card -->
              @if (asWWTP(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <dl class="space-y-3">
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Intensity</dt>
                      <dd class="text-sm text-gray-900">
                        <span class="font-semibold">{{ odour.intensity }}</span><span class="text-gray-400">/5</span>
                        <span class="ml-1.5 text-gray-500">({{ odourLabel(odour.intensity) }})</span>
                      </dd>
                    </div>
                    @if (odour.nature.length > 0) {
                      <div>
                        <dt class="text-xs font-medium text-gray-500 mb-1">Nature</dt>
                        <dd class="flex flex-wrap gap-1.5">
                          @for (tag of odour.nature; track tag) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {{ formatTag(tag) }}
                            </span>
                          }
                        </dd>
                      </div>
                    }
                  </dl>
                </div>
              }
            </div>

            <!-- Product Applications Table -->
            @if (asWWTP(obs).productApplications.length > 0) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asWWTP(obs).productApplications }" />
            }
          }
        </div>
      }

      <!-- Shared Product Applications Table Template -->
      <ng-template #productTable let-applications>
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div class="px-5 py-4 border-b border-gray-200">
            <h3 class="text-sm font-semibold text-gray-900">Product Applications</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (app of applications; track app.productId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm font-medium">
                      <a [routerLink]="['/products', app.productId]" class="text-teal-600 hover:text-teal-700 hover:underline">{{ app.productName }}</a>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ app.quantity }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ app.unit }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ app.method }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ app.zone || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </ng-template>

      <!-- Notes Section -->
      @if (v.notes || v.followUpRequired || v.nextVisitDate) {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Notes</h2>
          <div class="space-y-4">
            @if (v.notes) {
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ v.notes }}</p>
            }

            @if (v.followUpRequired) {
              <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p class="text-sm font-semibold text-amber-800">Follow-up Required</p>
                  @if (v.followUpNotes) {
                    <p class="text-sm text-amber-700 mt-1">{{ v.followUpNotes }}</p>
                  }
                </div>
              </div>
            }

            @if (v.nextVisitDate) {
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Next visit scheduled: <span class="font-medium text-gray-900">{{ v.nextVisitDate }}</span></span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Photos Section -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-base font-semibold text-gray-900 mb-4">
          Photos
          @if (v.photoIds.length > 0) {
            <span class="ml-2 text-sm font-normal text-gray-500">({{ v.photoIds.length }})</span>
          }
        </h2>
        @if (v.photoIds.length > 0) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (photoId of v.photoIds; track photoId) {
              <div class="aspect-square rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div class="text-center">
                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p class="text-xs text-gray-400">{{ photoId }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-8">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p class="text-sm text-gray-500">No photos attached</p>
          </div>
        }
      </div>
    } @else {
      <div class="text-center py-16">
        <p class="text-gray-400 mb-4">Site visit not found</p>
        <a routerLink="/site-visits" class="text-teal-600 hover:underline text-sm">&larr; Back to Site Visits</a>
      </div>
    }
  `,
})
export class SiteVisitDetailComponent {
  private route = inject(ActivatedRoute);
  private siteVisitService = inject(SiteVisitService);
  private systemService = inject(SystemService);
  private clientService = inject(ClientService);

  readonly visit = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.siteVisitService.getById(id);
  });

  readonly systemName = computed(() => {
    const v = this.visit();
    return v ? (this.systemService.getById(v.systemId)?.name ?? 'Unknown System') : '';
  });

  readonly clientName = computed(() => {
    const v = this.visit();
    return v ? (this.clientService.getById(v.clientId)?.name ?? 'Unknown Client') : '';
  });

  /** Type-narrowing helpers for the discriminated union in templates */
  asLiftStation(obs: any): LiftStationObservation { return obs; }
  asLagoon(obs: any): LagoonObservation { return obs; }
  asWWTP(obs: any): WWTPObservation { return obs; }

  /** Format kebab-case strings to title case */
  formatTag(tag: string): string {
    return tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /** Format kebab-case activity type to readable label */
  formatActivityType(type: string): string {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /** Format visit status for display */
  formatStatus(status: VisitStatus): string {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /** Map visit status to badge colour */
  statusColor(status: VisitStatus): 'green' | 'blue' | 'yellow' | 'gray' | 'red' {
    const map: Record<VisitStatus, 'green' | 'blue' | 'yellow' | 'gray' | 'red'> = {
      completed: 'green',
      scheduled: 'blue',
      'in-progress': 'yellow',
      cancelled: 'gray',
    };
    return map[status] ?? 'gray';
  }

  /** Human-readable odour intensity label */
  odourLabel(intensity: number): string {
    const labels: Record<number, string> = {
      1: 'Very Faint',
      2: 'Faint',
      3: 'Moderate',
      4: 'Strong',
      5: 'Very Strong',
    };
    return labels[intensity] ?? 'Unknown';
  }

  /** Dot colour class for WWTP effluent clarity indicator */
  clarityDotClass(clarity: string): string {
    const map: Record<string, string> = {
      clear: 'bg-green-500',
      'slightly-turbid': 'bg-yellow-500',
      turbid: 'bg-amber-500',
      opaque: 'bg-red-500',
    };
    return map[clarity] ?? 'bg-gray-400';
  }
}
