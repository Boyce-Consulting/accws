import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { InvitationService } from '../../../core/services/invitation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { InvitationPreview } from '../../../core/services/adapters';

const PENDING_INVITE_KEY = 'accws_pending_invite_token';

@Component({
  selector: 'app-invitation-accept',
  imports: [RouterLink, TitleCasePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-white">You're invited</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @if (loading()) {
            <p class="text-sm text-gray-500 text-center">Loading invitation…</p>
          } @else if (error()) {
            <div class="text-center">
              <p class="text-sm text-danger mb-4">{{ error() }}</p>
              <a routerLink="/login" class="text-sm text-accent-600 hover:underline">Back to sign in</a>
            </div>
          } @else if (preview(); as p) {
            <div class="space-y-4">
              <p class="text-sm text-gray-700">
                @if (p.isSystemAdmin) {
                  <strong>{{ p.email }}</strong>, you've been invited to join ACCWS as a <strong>system administrator</strong>.
                } @else {
                  <strong>{{ p.email }}</strong>, you've been invited to join <strong>{{ p.organizationName }}</strong> as <strong>{{ p.role | titlecase }}</strong>.
                }
              </p>
              <p class="text-xs text-gray-500">Expires {{ formatDate(p.expiresAt) }}</p>

              @if (auth.isAuthenticated()) {
                @if (!emailMatches()) {
                  <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    This invitation is for {{ p.email }}, but you're signed in as {{ auth.currentUser()?.email }}.
                    <button (click)="logoutAndRetry()" class="underline mt-1 block">Sign out and accept</button>
                  </div>
                } @else {
                  <button (click)="accept()" [disabled]="accepting()"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (accepting()) { Accepting... } @else { Accept invitation }
                  </button>
                  @if (acceptError()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ acceptError() }}</div>
                  }
                }
              } @else {
                <p class="text-sm text-gray-600">You'll need to sign in (or create an account with <strong>{{ p.email }}</strong>) before accepting.</p>
                <button (click)="signInToAccept()"
                  class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm">
                  Sign in to accept
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class InvitationAcceptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitations = inject(InvitationService);
  auth = inject(AuthService);

  token = '';
  preview = signal<InvitationPreview | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  accepting = signal(false);
  acceptError = signal<string | null>(null);

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('No invitation token provided.');
      this.loading.set(false);
      return;
    }

    // If we just logged in and had a pending invite, this path is for us.
    this.invitations.preview(this.token).subscribe({
      next: (p) => {
        this.preview.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        const status = err?.status;
        if (status === 410) this.error.set('This invitation has already been used or has expired.');
        else if (status === 404) this.error.set('This invitation is no longer valid.');
        else this.error.set(err?.error?.message ?? 'Could not load invitation.');
        this.loading.set(false);
      },
    });
  }

  emailMatches(): boolean {
    const invited = this.preview()?.email.toLowerCase();
    const me = this.auth.currentUser()?.email.toLowerCase();
    return !!invited && !!me && invited === me;
  }

  signInToAccept(): void {
    localStorage.setItem(PENDING_INVITE_KEY, this.token);
    this.router.navigate(['/login']);
  }

  logoutAndRetry(): void {
    localStorage.setItem(PENDING_INVITE_KEY, this.token);
    this.auth.logout();
  }

  accept(): void {
    this.accepting.set(true);
    this.acceptError.set(null);
    this.invitations.accept(this.token).subscribe({
      next: () => {
        localStorage.removeItem(PENDING_INVITE_KEY);
        // Reload /me so organizations list picks up the new membership.
        this.auth.loadMe().subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/dashboard']),
        });
      },
      error: (err) => {
        this.acceptError.set(err?.error?.message ?? 'Could not accept invitation.');
        this.accepting.set(false);
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}

export { PENDING_INVITE_KEY };
