import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor, refreshInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

/**
 * Block app bootstrap until the session is hydrated from localStorage. Prevents
 * a race where the router activates routes before AuthService has confirmed
 * whether the stored JWT is still valid — which would flash authenticated
 * users back to /login on refresh.
 */
function initAuthFactory(): () => Promise<void> {
  const auth = inject(AuthService);
  return async () => {
    if (!auth.token()) return;
    try {
      await firstValueFrom(auth.loadMe());
    } catch {
      // loadMe already clears the session on failure.
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
    { provide: APP_INITIALIZER, multi: true, useFactory: initAuthFactory },
  ],
};
