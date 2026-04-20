import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { InvitationService } from '../../core/services/invitation.service';
import { OrganizationMember, OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/auth/auth.service';
import { InvitationRole, OrgInvitation } from '../../core/services/adapters';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-people',
  imports: [FormsModule, TitleCasePipe, PageHeaderComponent],
  template: `
    <app-page-header title="People" [subtitle]="subtitle()" />

    @if (!auth.currentOrgId()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500 max-w-3xl">
        Select an organization first.
      </div>
    } @else if (!canManage()) {
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500 max-w-3xl">
        Only organization owners and admins can manage members.
      </div>
    } @else {
      <div class="max-w-3xl space-y-6">
        <!-- Members list -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Members</h2>
          @if (membersLoading()) {
            <p class="text-sm text-gray-500">Loading members…</p>
          } @else if (members().length > 0) {
            <ul class="divide-y divide-gray-100">
              @for (m of members(); track m.id) {
                <li class="flex items-center gap-3 py-3">
                  <div class="w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {{ initialsOf(m.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ m.name }}
                      @if (m.isSystemAdmin) {
                        <span class="ml-2 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-100 text-primary-700 uppercase tracking-wider">Sys Admin</span>
                      }
                    </p>
                    <p class="text-xs text-gray-500 truncate">{{ m.email }}</p>
                  </div>
                  <span class="text-xs font-medium uppercase tracking-wider px-2 py-1 rounded border"
                    [class]="roleChipClass(m.role)">
                    {{ m.role | titlecase }}
                  </span>
                </li>
              }
            </ul>
          } @else {
            <div class="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
              Member list is not available yet. Backend endpoint
              <code class="text-xs">GET /api/organizations/&#123;id&#125;/members</code> pending.
            </div>
          }
        </div>

        <!-- Invite form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-2">Invite someone to {{ auth.currentOrg()?.name }}</h2>
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
        </div>

        @if (listable()) {
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-900 mb-4">Pending invitations</h2>
            @if (invites().length === 0) {
              <p class="text-sm text-gray-500">No pending invitations.</p>
            } @else {
              <ul class="divide-y divide-gray-100">
                @for (inv of invites(); track inv.id) {
                  <li class="flex items-center justify-between py-3">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ inv.email || inv.target }}</p>
                      <p class="text-xs text-gray-500">{{ inv.role | titlecase }} &bull; expires {{ formatDate(inv.expiresAt) }}</p>
                    </div>
                    <button (click)="revoke(inv.id)" class="text-xs text-danger hover:underline">Revoke</button>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>
    }
  `,
})
export class PeopleComponent implements OnInit {
  auth = inject(AuthService);
  private invitations = inject(InvitationService);
  private orgService = inject(OrganizationService);

  members = signal<OrganizationMember[]>([]);
  membersLoading = signal(true);

  useEmail = true;
  usePhone = false;
  inviteEmail = '';
  invitePhone = '';
  inviteRole: InvitationRole = 'member';
  inviteLoading = signal(false);
  inviteError = signal<string | null>(null);
  inviteMessage = signal<string | null>(null);

  invites = signal<OrgInvitation[]>([]);
  listable = signal(false);

  subtitle = computed(() => {
    const org = this.auth.currentOrg();
    return org ? `Manage who has access to ${org.name}` : 'Manage your organization members';
  });

  canManage = computed(() => {
    if (this.auth.uiShowsAdmin()) return !!this.auth.currentOrgId();
    const activeId = this.auth.currentOrgId();
    const membership = this.auth.organizations().find((m) => m.id === activeId);
    return membership?.role === 'owner' || membership?.role === 'admin';
  });

  canSendInvite(): boolean {
    return (this.useEmail && !!this.inviteEmail) || (this.usePhone && !!this.invitePhone);
  }

  ngOnInit(): void {
    this.loadInvites();
    this.loadMembers();
  }

  loadMembers(): void {
    const orgId = this.auth.currentOrgId();
    if (!orgId || !this.canManage()) {
      this.membersLoading.set(false);
      return;
    }
    this.orgService.listMembers(orgId).subscribe({
      next: (list) => {
        this.members.set(list);
        this.membersLoading.set(false);
      },
      error: () => this.membersLoading.set(false),
    });
  }

  initialsOf(name: string): string {
    return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  roleChipClass(role: 'owner' | 'admin' | 'member'): string {
    const m: Record<string, string> = {
      owner: 'bg-accent-50 text-accent-700 border-accent-200',
      admin: 'bg-primary-50 text-primary-700 border-primary-200',
      member: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return m[role] ?? m['member'];
  }

  loadInvites(): void {
    if (!this.canManage()) return;
    this.invitations.listForOrg().subscribe({
      next: (list) => {
        this.invites.set(list.filter((i) => !i.acceptedAt));
        this.listable.set(true);
      },
      error: () => this.listable.set(false),
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
    this.invitations.createForOrg(opts).subscribe({
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

  revoke(id: string): void {
    this.invitations.revokeForOrg(id).subscribe({
      next: () => this.loadInvites(),
      error: (err) => this.inviteError.set(err?.error?.message ?? 'Could not revoke.'),
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
