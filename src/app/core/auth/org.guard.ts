import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Blocks client-scoped routes when no active org is selected. Admins bypass. */
export const orgGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  if (auth.currentOrgId()) return true;
  return router.createUrlTree(['/forbidden']);
};
