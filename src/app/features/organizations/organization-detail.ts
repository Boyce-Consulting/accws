import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { OrganizationService } from '../../core/services/organization.service';
import { SystemService } from '../../core/services/system.service';
import { InvitationService } from '../../core/services/invitation.service';
import { AuthService } from '../../core/auth/auth.service';
import { Organization } from '../../core/models/organization.model';
import { WastewaterSystem } from '../../core/models/system.model';
import { InvitationRole, OrgInvitation } from '../../core/services/adapters';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-organization-detail',
  imports: [RouterLink, FormsModule, TitleCasePipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p class="text-sm text-gray-500">Loading organization…</p>
    } @else if (org(); as o) {
      <app-page-header [title]="o.name" [subtitle]="o.type ? (o.type | titlecase) : ''">
        <div class="flex items-center gap-3">
          @if (auth.uiShowsAdmin()) {
            @if (editing()) {
              <button (click)="cancelEdit()" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            } @else {
              <button (click)="startEdit(o)" class="text-sm text-accent-600 hover:text-accent-700 font-medium">Edit</button>
            }
          }
          <a routerLink="/organizations" class="text-sm text-gray-500 hover:text-gray-700">&larr; Back</a>
        </div>
      </app-page-header>

      @if (editing() && auth.uiShowsAdmin()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Edit organization</h2>
          <form (ngSubmit)="saveEdit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input [(ngModel)]="editForm.name" name="n" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select [(ngModel)]="editForm.type" name="t" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">—</option>
                <option value="multi-system">Multi-system</option>
                <option value="single-use">Single-use</option>
                <option value="regional-collection">Regional collection</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select [(ngModel)]="editForm.status" name="s" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">—</option>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact name</label>
              <input [(ngModel)]="editForm.contact_name" name="cn" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
              <input type="email" [(ngModel)]="editForm.contact_email" name="ce" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact phone</label>
              <input [(ngModel)]="editForm.contact_phone" name="cp" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input [(ngModel)]="editForm.province" name="pv" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input [(ngModel)]="editForm.address" name="a" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea [(ngModel)]="editForm.notes" name="nt" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
            </div>
            @if (editError()) {
              <div class="sm:col-span-2 text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ editError() }}</div>
            }
            <div class="sm:col-span-2 flex items-center gap-3">
              <button type="submit" [disabled]="editSaving()" class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
                @if (editSaving()) { Saving... } @else { Save changes }
              </button>
              <button type="button" (click)="confirmDelete()" class="text-sm text-danger hover:underline ml-auto">Delete organization</button>
            </div>
          </form>
        </div>
      }

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

      @if (canManageMembers()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 class="text-base font-semibold text-gray-900 mb-2">Invite someone to {{ o.name }}</h2>
          <p class="text-sm text-gray-600 mb-4">They'll receive a secure link by email, SMS, or both.</p>
          <form (ngSubmit)="sendInvite()" class="space-y-3">
            <div class="flex gap-4 text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="useEmail" name="ue" class="text-accent-500 focus:ring-accent-500" />
                <span>Email</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="usePhone" name="up" class="text-accent-500 focus:ring-accent-500" />
                <span>SMS</span>
              </label>
            </div>
            @if (useEmail) {
              <input type="email" [(ngModel)]="inviteEmail" name="ie" placeholder="name@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            }
            @if (usePhone) {
              <input type="tel" [(ngModel)]="invitePhone" name="ip" placeholder="+17805551234"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            }
            <select [(ngModel)]="inviteRole" name="ir" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            @if (inviteError()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ inviteError() }}</div> }
            @if (inviteMessage()) { <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{{ inviteMessage() }}</div> }
            <button type="submit" [disabled]="inviteLoading() || !canSendInvite()"
              class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
              @if (inviteLoading()) { Sending... } @else { Send invite }
            </button>
          </form>

          @if (invites().length > 0) {
            <div class="mt-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Pending invitations</h3>
              <ul class="divide-y divide-gray-100">
                @for (inv of invites(); track inv.id) {
                  <li class="flex items-center justify-between py-2">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ inv.email || inv.target }}</p>
                      <p class="text-xs text-gray-500">{{ inv.role | titlecase }} &bull; expires {{ formatDate(inv.expiresAt) }}</p>
                    </div>
                    <button (click)="revokeInvite(inv.id)" class="text-xs text-danger hover:underline">Revoke</button>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }

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
  private invitations = inject(InvitationService);
  auth = inject(AuthService);

  orgId = '';
  org = signal<Organization | null>(null);
  systems = signal<WastewaterSystem[]>([]);
  loading = signal(true);

  // Invite form state
  useEmail = true;
  usePhone = false;
  inviteEmail = '';
  invitePhone = '';
  inviteRole: InvitationRole = 'member';
  inviteLoading = signal(false);
  inviteError = signal<string | null>(null);
  inviteMessage = signal<string | null>(null);
  invites = signal<(OrgInvitation & { target?: string })[]>([]);

  // Edit form state
  editing = signal(false);
  editForm: {
    name: string;
    type: string;
    status: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    province: string;
    notes: string;
  } = { name: '', type: '', status: '', contact_name: '', contact_email: '', contact_phone: '', address: '', province: '', notes: '' };
  editSaving = signal(false);
  editError = signal<string | null>(null);

  canManageMembers = computed(() => {
    if (this.auth.uiShowsAdmin()) return true;
    const membership = this.auth.organizations().find((m) => m.id === this.orgId);
    return membership?.role === 'owner' || membership?.role === 'admin';
  });

  canSendInvite(): boolean {
    const hasEmail = this.useEmail && !!this.inviteEmail;
    const hasPhone = this.usePhone && !!this.invitePhone;
    return hasEmail || hasPhone;
  }

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.orgId) {
      this.loading.set(false);
      return;
    }
    this.orgService.get(this.orgId).subscribe({
      next: (o) => {
        this.org.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    // For admins, temporarily switch active org so SystemService can scope.
    if (this.auth.uiShowsAdmin()) {
      this.auth.setCurrentOrg(this.orgId);
    }
    this.systemService.list().subscribe({ next: (list) => this.systems.set(list) });
    this.loadInvites();
  }

  loadInvites(): void {
    if (!this.canManageMembers()) return;
    this.invitations.listForOrg(this.orgId).subscribe({
      next: (list) => this.invites.set(list.filter((i) => !i.acceptedAt)),
      error: () => {},
    });
  }

  sendInvite(): void {
    this.inviteError.set(null);
    this.inviteMessage.set(null);
    this.inviteLoading.set(true);
    const opts: { email?: string; phone?: string; role: InvitationRole } = { role: this.inviteRole };
    if (this.useEmail && this.inviteEmail) opts.email = this.inviteEmail;
    if (this.usePhone && this.invitePhone) opts.phone = this.invitePhone;
    const target = opts.email ?? opts.phone ?? '';
    this.invitations.createForOrg(opts, this.orgId).subscribe({
      next: () => {
        this.inviteMessage.set(`Invitation sent to ${target}.`);
        this.inviteEmail = '';
        this.invitePhone = '';
        this.inviteLoading.set(false);
        this.loadInvites();
      },
      error: (err) => {
        this.inviteError.set(err?.error?.message ?? 'Could not send invite.');
        this.inviteLoading.set(false);
      },
    });
  }

  revokeInvite(id: string): void {
    this.invitations.revokeForOrg(id, this.orgId).subscribe({
      next: () => this.loadInvites(),
      error: (err) => this.inviteError.set(err?.error?.message ?? 'Could not revoke.'),
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }

  startEdit(o: Organization): void {
    this.editForm = {
      name: o.name,
      type: o.type ?? '',
      status: o.status ?? '',
      contact_name: o.contactName ?? '',
      contact_email: o.contactEmail ?? '',
      contact_phone: o.contactPhone ?? '',
      address: o.address ?? '',
      province: o.province ?? '',
      notes: o.notes ?? '',
    };
    this.editError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editError.set(null);
  }

  saveEdit(): void {
    if (!this.editForm.name) return;
    this.editSaving.set(true);
    this.editError.set(null);
    // Only send fields the user actually changed. Empty strings get stripped
    // so we don't wipe existing values with blanks.
    const body: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.editForm)) {
      if (v !== '') body[k] = v;
    }
    this.orgService.update(this.orgId, body).subscribe({
      next: (updated) => {
        this.org.set(updated);
        this.editing.set(false);
        this.editSaving.set(false);
      },
      error: (err) => {
        this.editError.set(err?.error?.message ?? 'Could not save.');
        this.editSaving.set(false);
      },
    });
  }

  confirmDelete(): void {
    if (!confirm(`Delete ${this.org()?.name}? This cascades to all its systems, treatments, visits, and samples. This cannot be undone.`)) return;
    this.orgService.delete(this.orgId).subscribe({
      next: () => window.location.assign('/organizations'),
      error: (err) => this.editError.set(err?.error?.message ?? 'Could not delete.'),
    });
  }
}
