import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvitationService } from '../../../core/services/invitation.service';
import { AdminInvitation } from '../../../core/services/adapters';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-system-admins',
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="System Administrators" subtitle="Manage who has full ACCWS admin access" />

    <div class="max-w-3xl space-y-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-2">Invite a system administrator</h2>
        <p class="text-sm text-gray-600 mb-4">Invitees become full ACCWS admins on accept. 2FA enrollment is forced on their first sign-in.</p>
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
            <input type="email" [(ngModel)]="inviteEmail" name="ie" placeholder="name@accws.ca"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          }
          @if (usePhone) {
            <input type="tel" [(ngModel)]="invitePhone" name="ip" placeholder="+17805551234"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          }
          @if (error()) { <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error() }}</div> }
          @if (message()) { <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{{ message() }}</div> }
          <button type="submit" [disabled]="loading() || !canSend()"
            class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-sm">
            @if (loading()) { Sending... } @else { Send invite }
          </button>
        </form>
      </div>

      @if (listable()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Pending admin invitations</h2>
          @if (invites().length === 0) {
            <p class="text-sm text-gray-500">No pending invitations.</p>
          } @else {
            <ul class="divide-y divide-gray-100">
              @for (inv of invites(); track inv.id) {
                <li class="flex items-center justify-between py-3">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ inv.email }}</p>
                    <p class="text-xs text-gray-500">Expires {{ formatDate(inv.expiresAt) }}</p>
                  </div>
                  <button (click)="revoke(inv.id)" class="text-xs text-danger hover:underline">Revoke</button>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
})
export class SystemAdminsComponent implements OnInit {
  private invitations = inject(InvitationService);

  useEmail = true;
  usePhone = false;
  inviteEmail = '';
  invitePhone = '';

  loading = signal(false);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  invites = signal<AdminInvitation[]>([]);
  listable = signal(false);

  ngOnInit(): void {
    this.load();
  }

  canSend(): boolean {
    return (this.useEmail && !!this.inviteEmail) || (this.usePhone && !!this.invitePhone);
  }

  load(): void {
    this.invitations.listAdmin().subscribe({
      next: (list) => {
        this.invites.set(list.filter((i) => !i.acceptedAt));
        this.listable.set(true);
      },
      error: () => this.listable.set(false),
    });
  }

  sendInvite(): void {
    this.error.set(null);
    this.message.set(null);
    this.loading.set(true);
    const opts: { email?: string; phone?: string } = {};
    if (this.useEmail && this.inviteEmail) opts.email = this.inviteEmail;
    if (this.usePhone && this.invitePhone) opts.phone = this.invitePhone;
    const target = opts.email ?? opts.phone ?? '';
    this.invitations.createAdmin(opts).subscribe({
      next: () => {
        this.message.set(`Admin invitation sent to ${target}.`);
        this.inviteEmail = '';
        this.invitePhone = '';
        this.loading.set(false);
        this.load();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not send invite.');
        this.loading.set(false);
      },
    });
  }

  revoke(id: string): void {
    this.invitations.revokeAdmin(id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(err?.error?.message ?? 'Could not revoke.'),
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
