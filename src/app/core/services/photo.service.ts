import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Envelope } from './adapters';

interface PhotoUrlDto {
  url: string;
  expires_at: string;
  mime_type: string;
  caption?: string;
}

export interface PhotoUrl {
  url: string;
  expiresAt: string;
  mimeType: string;
  caption?: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);

  private cache = new Map<string, PhotoUrl>();

  url(photoId: string): Observable<PhotoUrl> {
    const cached = this.cache.get(photoId);
    if (cached && new Date(cached.expiresAt).getTime() > Date.now() + 30_000) {
      return of(cached);
    }
    return this.http
      .get<Envelope<PhotoUrlDto>>(`${this.base}/photos/${photoId}/url`)
      .pipe(
        map((r) => ({
          url: r.data.url,
          expiresAt: r.data.expires_at,
          mimeType: r.data.mime_type,
          caption: r.data.caption,
        })),
        tap((p) => this.cache.set(photoId, p)),
      );
  }
}
