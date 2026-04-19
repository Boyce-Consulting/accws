import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { SiteVisitService } from '../../core/services/site-visit.service';
import { SystemService } from '../../core/services/system.service';
import { PhotoService } from '../../core/services/photo.service';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import {
  SiteVisit,
  VisitStatus,
  LiftStationObservation,
  LagoonObservation,
  WWTPObservation,
} from '../../core/models/site-visit.model';
import { WastewaterSystem } from '../../core/models/system.model';

@Component({
  selector: 'app-site-visit-detail',
  imports: [RouterLink, NgTemplateOutlet, DatePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading visit…</p>
    } @else if (visit(); as v) {
      <app-page-header [title]="systemName() + ' — ' + (v.visitDate | date:'mediumDate')" [subtitle]="auth.currentOrg()?.name ?? ''">
        <a routerLink="/site-visits" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Site Visits</a>
      </app-page-header>

      <div class="flex flex-wrap items-center gap-4 mb-6">
        <app-status-badge [label]="formatStatus(v.status)" [color]="statusColor(v.status)" />
        @if (v.visitedBy) {
          <span class="text-sm text-gray-600">Visited by <span class="font-medium text-gray-900">{{ v.visitedBy }}</span></span>
        }
      </div>

      @if (v.weather; as w) {
        <div class="bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-lg px-4 py-2.5 mb-6 flex items-center gap-2 text-sm text-[#1e3a5f] overflow-x-auto">
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

      @if (v.activities?.length) {
        <div class="mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-3">Activities</h2>
          <div class="flex flex-wrap gap-2">
            @for (a of v.activities; track a.type) {
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                {{ formatTag(a.type) }}
              </span>
            }
          </div>
        </div>
      }

      @if (v.observation; as obs) {
        <div class="mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Observations</h2>

          @if (obs.systemType === 'lift-station') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">FOG</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Status</dt>
                    <dd class="text-sm font-medium" [class]="asLiftStation(obs).fogPresent ? 'text-amber-600' : 'text-green-600'">
                      {{ asLiftStation(obs).fogPresent ? 'Present' : 'Not Present' }}
                    </dd>
                  </div>
                  @if (asLiftStation(obs).fogSurfaceCoveragePct != null) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500">Surface Coverage</dt>
                      <dd class="text-sm text-gray-900">{{ asLiftStation(obs).fogSurfaceCoveragePct }}%</dd>
                    </div>
                  }
                </dl>
              </div>

              @if (asLiftStation(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <p class="text-sm text-gray-900"><span class="font-semibold">{{ odour.intensity }}</span>/5</p>
                  @if (odour.nature.length > 0) {
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      @for (tag of odour.nature; track tag) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{{ formatTag(tag) }}</span>
                      }
                    </div>
                  }
                </div>
              }

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
                        <p class="text-xs text-gray-500 mb-0.5">H&#8322;S</p>
                        <p class="text-lg font-semibold" [class]="asLiftStation(obs).h2sReading! > 10 ? 'text-red-600' : 'text-gray-900'">{{ asLiftStation(obs).h2sReading }}</p>
                        <p class="text-xs text-gray-400">ppm</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            @if (asLiftStation(obs).productApplications?.length) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asLiftStation(obs).productApplications }" />
            }
          }

          @if (obs.systemType === 'lagoon') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Water</h3>
                <dl class="space-y-3">
                  @if (asLagoon(obs).waterColour?.length) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500 mb-1">Colour</dt>
                      <dd class="flex flex-wrap gap-1.5">
                        @for (tag of asLagoon(obs).waterColour!; track tag) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{{ formatTag(tag) }}</span>
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
                </dl>
              </div>

              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Vegetation</h3>
                <dl class="space-y-3">
                  @if (asLagoon(obs).algaeType?.length) {
                    <div>
                      <dt class="text-xs font-medium text-gray-500 mb-1">Algae</dt>
                      <dd class="flex flex-wrap gap-1.5">
                        @for (tag of asLagoon(obs).algaeType!; track tag) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">{{ formatTag(tag) }}</span>
                        }
                      </dd>
                    </div>
                  }
                  <div>
                    <dt class="text-xs font-medium text-gray-500">Cattails</dt>
                    <dd class="text-sm text-gray-900 capitalize">{{ asLagoon(obs).cattailSeverity }}</dd>
                  </div>
                </dl>
              </div>

              @if (asLagoon(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <p class="text-sm text-gray-900"><span class="font-semibold">{{ odour.intensity }}</span>/5</p>
                </div>
              }
            </div>

            @if (asLagoon(obs).productApplications?.length) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asLagoon(obs).productApplications }" />
            }
          }

          @if (obs.systemType === 'wwtp') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Effluent</h3>
                <p class="text-sm font-medium text-gray-900">{{ formatTag(asWWTP(obs).effluentClarity) }}</p>
              </div>
              @if (asWWTP(obs).odour; as odour) {
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 class="text-sm font-semibold text-gray-900 mb-3">Odour</h3>
                  <p class="text-sm text-gray-900"><span class="font-semibold">{{ odour.intensity }}</span>/5</p>
                </div>
              }
            </div>

            @if (asWWTP(obs).productApplications?.length) {
              <ng-container *ngTemplateOutlet="productTable; context: { $implicit: asWWTP(obs).productApplications }" />
            }
          }
        </div>
      }

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
                    <td class="px-4 py-3 text-sm text-gray-600">{{ app.method || '—' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ app.zone || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </ng-template>

      @if (v.notes || v.followUpRequired || v.nextVisitDate) {
        <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Notes</h2>
          <div class="space-y-4">
            @if (v.notes) {
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ v.notes }}</p>
            }
            @if (v.followUpRequired) {
              <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p class="text-sm font-semibold text-amber-800">Follow-up Required</p>
                  @if (v.followUpNotes) { <p class="text-sm text-amber-700 mt-1">{{ v.followUpNotes }}</p> }
                </div>
              </div>
            }
            @if (v.nextVisitDate) {
              <p class="text-sm text-gray-600">Next visit: <span class="font-medium text-gray-900">{{ v.nextVisitDate | date:'mediumDate' }}</span></p>
            }
          </div>
        </div>
      }

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
              <div class="aspect-square rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                @if (photoUrls()[photoId]; as url) {
                  <img [src]="url" [alt]="'Photo ' + photoId" class="w-full h-full object-cover" />
                } @else {
                  <span class="text-xs text-gray-400">Loading…</span>
                }
              </div>
            }
          </div>
        } @else {
          <p class="text-sm text-gray-500 text-center py-4">No photos attached</p>
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
  private photoService = inject(PhotoService);
  auth = inject(AuthService);

  visit = signal<SiteVisit | null>(null);
  loading = signal(true);
  systems = signal<WastewaterSystem[]>([]);
  photoUrls = signal<Record<string, string>>({});

  systemName = computed(() => {
    const v = this.visit();
    return v ? this.systems().find((s) => s.id === v.systemId)?.name ?? 'Unknown System' : '';
  });

  asLiftStation(obs: unknown): LiftStationObservation { return obs as LiftStationObservation; }
  asLagoon(obs: unknown): LagoonObservation { return obs as LagoonObservation; }
  asWWTP(obs: unknown): WWTPObservation { return obs as WWTPObservation; }

  formatTag(t: string): string {
    return t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatStatus(s: VisitStatus): string {
    return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  statusColor(s: VisitStatus): 'green' | 'blue' | 'yellow' | 'gray' {
    const m: Record<VisitStatus, 'green' | 'blue' | 'yellow' | 'gray'> = {
      completed: 'green',
      scheduled: 'blue',
      'in-progress': 'yellow',
      cancelled: 'gray',
    };
    return m[s] ?? 'gray';
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    effect(() => {
      const orgId = this.auth.currentOrgId();
      if (!orgId || !id) return;
      this.loading.set(true);
      this.siteVisitService.get(id).subscribe({
        next: (v) => {
          this.visit.set(v);
          this.loading.set(false);
          this.loadPhotos(v.photoIds);
        },
        error: () => this.loading.set(false),
      });
      this.systemService.list().subscribe({ next: (list) => this.systems.set(list) });
    });
  }

  private loadPhotos(ids: string[]): void {
    for (const id of ids) {
      this.photoService.url(id).subscribe({
        next: (p) => this.photoUrls.update((m) => ({ ...m, [id]: p.url })),
        error: () => {},
      });
    }
  }
}
