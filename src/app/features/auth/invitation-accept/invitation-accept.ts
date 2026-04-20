import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { InvitationService } from '../../../core/services/invitation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { InvitationPreview } from '../../../core/services/adapters';

const PENDING_INVITE_KEY = 'accws_pending_invite_token';

type Mode = 'loading' | 'error' | 'sign-in' | 'register';

@Component({
  selector: 'app-invitation-accept',
  imports: [FormsModule, RouterLink, TitleCasePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-white">You're invited</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @switch (mode()) {
            @case ('loading') {
              <p class="text-sm text-gray-500 text-center">Loading invitation…</p>
            }

            @case ('error') {
              <div class="text-center">
                <p class="text-sm text-danger mb-4">{{ error() }}</p>
                <a routerLink="/login" class="text-sm text-accent-600 hover:underline">Back to sign in</a>
              </div>
            }

            @case ('sign-in') {
              @if (preview(); as p) {
                <div class="space-y-4">
                  <p class="text-sm text-gray-700">
                    @if (p.grantsAdmin && !p.organizationId) {
                      <strong>{{ p.target }}</strong>, you've been invited to join ACCWS as a <strong>system administrator</strong>.
                    } @else {
                      <strong>{{ p.target }}</strong>, you've been invited to join <strong>{{ p.organizationName }}</strong> as <strong>{{ p.role | titlecase }}</strong>.
                    }
                  </p>
                  <p class="text-xs text-gray-500">Expires {{ formatDate(p.expiresAt) }}</p>
                  <div class="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    An account already exists for this invitation. Sign in to accept.
                  </div>

                  @if (auth.isAuthenticated()) {
                    @if (!identityMatches()) {
                      <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        This invitation is for {{ p.target }}, but you're signed in as {{ auth.currentUser()?.email }}.
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
                    <button (click)="signInToAccept()"
                      class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm">
                      Sign in to accept
                    </button>
                  }
                </div>
              }
            }

            @case ('register') {
              @if (preview(); as p) {
                <form (ngSubmit)="submitRegister()" class="space-y-4">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Create your account</h2>
                    <p class="text-sm text-gray-500 mt-1">
                      @if (p.grantsAdmin && !p.organizationId) {
                        Joining ACCWS as a <strong>system administrator</strong>.
                      } @else {
                        Joining <strong>{{ p.organizationName }}</strong> as <strong>{{ p.role | titlecase }}</strong>.
                      }
                    </p>
                    <p class="text-xs text-gray-500 mt-1">Sent to {{ p.target }} • expires {{ formatDate(p.expiresAt) }}</p>
                  </div>

                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                    <input id="name" type="text" [(ngModel)]="name" name="name" autocomplete="name" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                      [disabled]="registering()" />
                  </div>

                  @if (needsEmail()) {
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input id="email" type="email" [(ngModel)]="email" name="email" autocomplete="email" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                        [disabled]="registering()" />
                      <p class="text-xs text-gray-500 mt-1">You'll use this to sign in.</p>
                    </div>
                  }

                  <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="password" type="password" [(ngModel)]="password" name="password" autocomplete="new-password" minlength="8" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                      [disabled]="registering()" />
                  </div>

                  <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                    <input id="password_confirmation" type="password" [(ngModel)]="passwordConfirmation" name="password_confirmation" autocomplete="new-password" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
                      [disabled]="registering()" />
                  </div>

                  @if (registerError()) {
                    <div class="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ registerError() }}</div>
                  }

                  <button type="submit"
                    [disabled]="registering() || !name || !password || password !== passwordConfirmation || (needsEmail() && !email)"
                    class="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 text-sm">
                    @if (registering()) { Creating account... } @else { Create account }
                  </button>
                </form>
              }
            }
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
  mode = signal<Mode>('loading');
  preview = signal<InvitationPreview | null>(null);
  error = signal<string | null>(null);

  // Accept (existing user) state
  accepting = signal(false);
  acceptError = signal<string | null>(null);

  // Register state
  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  registering = signal(false);
  registerError = signal<string | null>(null);

  needsEmail = computed(() => {
    const p = this.preview();
    return !!p && !!p.phone && !p.email;
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('No invitation token provided.');
      this.mode.set('error');
      return;
    }
    this.loadPreview();
  }

  private loadPreview(): void {
    this.invitations.preview(this.token).subscribe({
      next: (p) => {
        this.preview.set(p);
        this.mode.set(p.accountExists ? 'sign-in' : 'register');
      },
      error: (err) => {
        const status = err?.status;
        if (status === 410) this.error.set('This invitation has already been used or has expired.');
        else if (status === 404) this.error.set('This invitation is no longer valid.');
        else this.error.set(err?.error?.message ?? 'Could not load invitation.');
        this.mode.set('error');
      },
    });
  }

  identityMatches(): boolean {
    const p = this.preview();
    const me = this.auth.currentUser();
    if (!p || !me) return false;
    // Email-targeted invite
    if (p.email) return p.email.toLowerCase() === me.email.toLowerCase();
    // Phone-targeted invite: backend verifies server-side; don't block here.
    return true;
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

  submitRegister(): void {
    if (!this.name || !this.password) return;
    if (this.password !== this.passwordConfirmation) {
      this.registerError.set('Passwords do not match.');
      return;
    }
    this.registering.set(true);
    this.registerError.set(null);

    const body: { name: string; password: string; password_confirmation: string; email?: string } = {
      name: this.name,
      password: this.password,
      password_confirmation: this.passwordConfirmation,
    };
    if (this.needsEmail()) body.email = this.email;

    this.invitations.register(this.token, body).subscribe({
      next: (res) => {
        this.registering.set(false);
        // Backend returns 201 with { token, user } — sign the user in and go.
        this.auth.consumeLogin(res.token, res.user);
      },
      error: (err) => {
        this.registering.set(false);
        if (err?.status === 422 && err?.error?.account_exists) {
          // Account already exists for this email/phone → switch to sign-in path
          this.registerError.set(null);
          this.mode.set('sign-in');
          return;
        }
        if (err?.status === 410) {
          this.error.set('This invitation has already been used or has expired.');
          this.mode.set('error');
          return;
        }
        if (err?.status === 404) {
          this.error.set('This invitation is no longer valid.');
          this.mode.set('error');
          return;
        }
        // Validation errors or generic failure
        const msg = err?.error?.message ?? 'Could not create your account.';
        this.registerError.set(msg);
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}

export { PENDING_INVITE_KEY };
