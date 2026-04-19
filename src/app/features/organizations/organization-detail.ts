import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { OrganizationService } from '../../core/services/organization.service';
import { SystemService } from '../../core/services/system.service';
import { AuthService } from '../../core/auth/auth.service';
import { Organization } from '../../core/models/organization.model';
import { WastewaterSystem } from '../../core/models/system.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-organization-detail',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading organization…</p>
    } @else if (org(); as o) {
      <app-page-header [title]="o.name" [subtitle]="o.type ? (o.type | titlecase) : ''">
        <a routerLink="/organizations" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Contact</h2>
          <dl class="space-y-3">
            @if (o.contactName) { <div><dt class="text-xs font-medium text-gray-500">Contact</dt><dd class="text-sm text-gray-900">{{ o.contactName }}</dd></div> }
            @if (o.contactEmail) { <div><dt class="text-xs font-medium text-gray-500">Email</dt><dd class="text-sm text-accent-600">{{ o.contactEmail }}</dd></div> }
            @if (o.contactPhone) { <div><dt class="text-xs font-medium text-gray-500">Phone</dt><dd class="text-sm text-gray-900">{{ o.contactPhone }}</dd></div> }
            @if (o.address) { <div><dt class="text-xs font-medium text-gray-500">Address</dt><dd class="text-sm text-gray-900">{{ o.address }}</dd></div> }
            @if (o.province) { <div><dt class="text-xs font-medium text-gray-500">Province</dt><dd class="text-sm text-gray-900">{{ o.province }}</dd></div> }
          </dl>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Summary</h2>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-gray-900">{{ systems().length }}</p>
            <p class="text-xs text-gray-500 mt-1">Systems</p>
          </div>
          @if (o.notes) {
            <div class="mt-4 p-3 bg-amber-50 rounded-lg">
              <p class="text-xs font-medium text-amber-700 mb-1">Notes</p>
              <p class="text-sm text-gray-700">{{ o.notes }}</p>
            </div>
          }
        </div>
      </div>

      <h2 class="text-base font-semibold text-gray-900 mb-3">Systems</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (sys of systems(); track sys.id) {
          <a [routerLink]="['/systems', sys.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-900">{{ sys.name }}</h3>
              <app-status-badge [label]="sys.status | titlecase"
                [color]="sys.status === 'healthy' ? 'green' : sys.status === 'attention' ? 'yellow' : sys.status === 'critical' ? 'red' : 'gray'" />
            </div>
            <p class="text-xs text-gray-500">{{ sys.type | titlecase }} &bull; {{ sys.cells.length }} cell{{ sys.cells.length !== 1 ? 's' : '' }}</p>
          </a>
        } @empty {
          <div class="col-span-2 text-center py-8 text-gray-400 text-sm">No systems for this organization</div>
        }
      </div>
    } @else {
      <div class="text-center py-12">
        <p class="text-gray-500">Organization not found</p>
        <a routerLink="/organizations" class="text-accent-600 text-sm mt-2 inline-block">Back</a>
      </div>
    }
  `,
})
export class OrganizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganizationService);
  private systemService = inject(SystemService);
  auth = inject(AuthService);

  org = signal<Organization | null>(null);
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.orgService.get(id).subscribe({
      next: (o) => {
        this.org.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    // For admins, temporarily switch active org so SystemService can scope.
    if (this.auth.isAdmin()) {
      this.auth.setCurrentOrg(id);
    }
    this.systemService.list().subscribe({ next: (list) => this.systems.set(list) });
  }
}
