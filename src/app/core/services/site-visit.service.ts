import { Injectable, inject, computed } from '@angular/core';
import { SiteVisit, VisitStatus } from '../models/site-visit.model';
import { WeatherSnapshot, WeatherRecord } from '../models/weather.model';
import { MockDataService } from './mock-data.service';

// TODO: Import HttpClient when backend is ready
// import { HttpClient } from '@angular/common/http';
// import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class SiteVisitService {
  private mock = inject(MockDataService);
  // TODO: private http = inject(HttpClient);
  // TODO: private apiUrl = `${inject(API_BASE_URL)}/site-visits`;

  /** All site visits as a readonly computed signal */
  readonly siteVisits = computed(() => this.mock.siteVisits());

  /** All weather records as a readonly computed signal */
  readonly weather = computed(() => this.mock.weather());

  // -------------------------------------------------------------------------
  // Computed properties for filtering
  // -------------------------------------------------------------------------

  /** Visits with status 'scheduled' */
  readonly scheduled = computed(() =>
    this.siteVisits().filter(v => v.status === 'scheduled')
  );

  /** Visits with status 'completed' */
  readonly completed = computed(() =>
    this.siteVisits().filter(v => v.status === 'completed')
  );

  /** Visits with status 'in-progress' */
  readonly inProgress = computed(() =>
    this.siteVisits().filter(v => v.status === 'in-progress')
  );

  /** Upcoming visits: scheduled visits sorted by date ascending */
  readonly upcoming = computed(() =>
    this.siteVisits()
      .filter(v => v.status === 'scheduled')
      .sort((a, b) => a.visitDate.localeCompare(b.visitDate))
  );

  /** Recent visits: completed visits sorted by date descending */
  readonly recent = computed(() =>
    this.siteVisits()
      .filter(v => v.status === 'completed')
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
  );

  // -------------------------------------------------------------------------
  // Query methods
  // -------------------------------------------------------------------------

  /** Get all visits (alias for reading the signal) */
  getAllVisits(): SiteVisit[] {
    return this.siteVisits();
  }

  /** Look up a single site visit by ID */
  getById(id: string): SiteVisit | undefined {
    return this.siteVisits().find(v => v.id === id);
  }

  /** Alias for getById */
  getVisitById(id: string): SiteVisit | undefined {
    return this.getById(id);
  }

  /** Get all site visits for a specific wastewater system */
  getBySystemId(systemId: string): SiteVisit[] {
    return this.siteVisits().filter(v => v.systemId === systemId);
  }

  /** Alias for getBySystemId */
  getVisitsBySystem(systemId: string): SiteVisit[] {
    return this.getBySystemId(systemId);
  }

  /** Get all site visits for a specific client */
  getByClientId(clientId: string): SiteVisit[] {
    return this.siteVisits().filter(v => v.clientId === clientId);
  }

  /** Alias for getByClientId */
  getVisitsByClient(clientId: string): SiteVisit[] {
    return this.getByClientId(clientId);
  }

  /** Get all site visits with a specific status */
  getByStatus(status: VisitStatus): SiteVisit[] {
    return this.siteVisits().filter(v => v.status === status);
  }

  /** Get site visits that require follow-up */
  getRequiringFollowUp(): SiteVisit[] {
    return this.siteVisits().filter(v => v.followUpRequired);
  }

  // -------------------------------------------------------------------------
  // Weather
  // -------------------------------------------------------------------------

  /**
   * Get mock weather data for a system.
   * Returns the most recent weather record, or a generated snapshot
   * if no record exists.
   */
  getWeatherForSystem(systemId: string): WeatherSnapshot {
    const record = this.weather().find(w => w.systemId === systemId);
    if (record) {
      return record.weather;
    }
    // Fallback: return a sensible default for systems without weather data
    return {
      temperatureC: -5,
      windSpeedKmh: 10,
      windDirection: 'W',
      humidityPct: 60,
      precipitationMm: 0,
      conditions: 'Data Unavailable',
    };
  }

  /** Get the full weather record for a system on a given date */
  getWeatherRecord(systemId: string, date?: string): WeatherRecord | undefined {
    return this.weather().find(
      w => w.systemId === systemId && (!date || w.date === date)
    );
  }

  // -------------------------------------------------------------------------
  // Write operations — currently stubbed; swap for HTTP calls when ready
  // -------------------------------------------------------------------------

  /**
   * Create a new site visit.
   * TODO: return this.http.post<SiteVisit>(this.apiUrl, visit);
   */
  create(visit: Partial<SiteVisit>): void {
    console.log('TODO: Create site visit via API', visit);
  }

  /**
   * Update an existing site visit.
   * TODO: return this.http.patch<SiteVisit>(`${this.apiUrl}/${id}`, changes);
   */
  update(id: string, changes: Partial<SiteVisit>): void {
    console.log('TODO: Update site visit via API', id, changes);
  }

  /**
   * Delete a site visit.
   * TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
   */
  delete(id: string): void {
    console.log('TODO: Delete site visit via API', id);
  }
}
