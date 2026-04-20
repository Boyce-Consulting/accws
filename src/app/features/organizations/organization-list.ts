import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [RouterLink, FormsModule, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent, AvatarComponent],
  template: `
    <app-page-header title="Organizations" subtitle="Municipal and utility clients">
      @if (auth.uiShowsAdmin()) {
        <button (click)="showCreate.set(!showCreate())" class="inline-flex items-center gap-2 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg">
          @if (showCreate()) { Cancel } @else { + New organization }
        </button>
      }
    </app-page-header>

    @if (showCreate() && auth.uiShowsAdmin()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-xl">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Create organization</h2>
        <form (ngSubmit)="create()" class="space-y-3">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input id="name" type="text" [(ngModel)]="newName" name="name" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug <span class="text-gray-400 font-normal">(optional)</span></label>
            <input id="slug" type="text" [(ngModel)]="newSlug" name="slug" placeholder="town-of-example"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          @if (createError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ createError() }}</div> }
          <button type="submit" [disabled]="creating() || !newName"
            class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
            @if (creating()) { Creating... } @else { Create }
          </button>
        </form>
      </div>
    }

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
  auth = inject(AuthService);

  orgs = signal<Organization[]>([]);
  loading = signal(true);

  showCreate = signal(false);
  newName = '';
  newSlug = '';
  creating = signal(false);
  createError = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const source = this.auth.isAdmin() ? this.orgService.listAdmin() : this.orgService.list();
    source.subscribe({
      next: (list) => {
        this.orgs.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  create(): void {
    if (!this.newName) return;
    this.creating.set(true);
    this.createError.set(null);
    const body: { name: string; slug?: string } = { name: this.newName };
    if (this.newSlug) body.slug = this.newSlug;
    this.orgService.create(body).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreate.set(false);
        this.newName = '';
        this.newSlug = '';
        this.load();
      },
      error: (err) => {
        this.createError.set(err?.error?.message ?? 'Could not create organization.');
        this.creating.set(false);
      },
    });
  }
}
