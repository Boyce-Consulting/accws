import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/auth/auth.service';
import { Organization } from '../../core/models/organization.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { AvatarComponent } from '../../shared/components/avatar/avatar';

@Component({
  selector: 'app-organization-list',
  imports: [RouterLink, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent, AvatarComponent],
  template: `
    <app-page-header title="Organizations" subtitle="Municipal and utility clients" />

    @if (loading()) {
      <p class="text-sm text-gray-500">Loading organizations…</p>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (org of orgs(); track org.id) {
          <a [routerLink]="['/organizations', org.id]" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-accent-200 transition-all">
            <div class="flex items-start gap-3 mb-3">
              <app-avatar [name]="org.name" size="md" bgClass="bg-primary-500" />
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ org.name }}</h3>
                @if (org.type) { <p class="text-xs text-gray-500">{{ org.type | titlecase }}</p> }
              </div>
              @if (org.status) {
                <app-status-badge [label]="org.status | titlecase"
                  [color]="org.status === 'active' ? 'green' : org.status === 'prospect' ? 'blue' : 'gray'" />
              }
            </div>
            <div class="space-y-1.5 text-xs text-gray-600">
              @if (org.contactName) { <p>{{ org.contactName }}</p> }
              @if (org.province) { <p>{{ org.province }}</p> }
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-12 text-gray-400 text-sm">No organizations found</div>
        }
      </div>
    }
  `,
})
export class OrganizationListComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private auth = inject(AuthService);

  orgs = signal<Organization[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const source = this.auth.isAdmin() ? this.orgService.listAdmin() : this.orgService.list();
    source.subscribe({
      next: (list) => {
        this.orgs.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
