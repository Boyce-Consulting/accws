import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

export const USE_MOCK_DATA = new InjectionToken<boolean>('USE_MOCK_DATA', {
  providedIn: 'root',
  factory: () => true, // Set to false when backend is ready
});
