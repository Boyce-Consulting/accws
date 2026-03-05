import { Component, inject, OnDestroy, signal, computed, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemService } from '../../core/services/system.service';
import { ClientService } from '../../core/services/client.service';
import { AuthService } from '../../core/auth/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  imports: [],
  template: `
    <div class="flex flex-col h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      <!-- Header Bar -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h1 class="text-lg font-semibold text-gray-900">{{ auth.isAdmin() ? 'System Map' : 'My Sites' }}</h1>
        <div class="flex items-center gap-2">
          <!-- Status filter chips -->
          @for (f of filters; track f.value) {
            <button
              (click)="toggleFilter(f.value)"
              class="px-3 py-1 text-xs font-medium rounded-full border transition-colors"
              [class]="activeFilters().includes(f.value) ? f.activeClass : 'border-gray-300 text-gray-500 hover:bg-gray-50'">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Map Container -->
      <div id="system-map" class="flex-1"></div>

      <!-- Legend -->
      <div class="flex items-center gap-4 px-4 py-2 bg-white border-t border-gray-200 text-xs">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-500"></span> Healthy</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-amber-500"></span> Attention</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-500"></span> Critical</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-gray-400"></span> Offline</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    #system-map { width: 100%; min-height: 0; }
  `],
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  private systemService = inject(SystemService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  auth = inject(AuthService);

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  activeFilters = signal<string[]>(['healthy', 'attention', 'critical', 'offline']);

  filters = [
    { value: 'healthy', label: 'Healthy', activeClass: 'border-green-500 bg-green-50 text-green-700' },
    { value: 'attention', label: 'Attention', activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
    { value: 'critical', label: 'Critical', activeClass: 'border-red-500 bg-red-50 text-red-700' },
    { value: 'offline', label: 'Offline', activeClass: 'border-gray-500 bg-gray-50 text-gray-700' },
  ];

  filteredSystems = computed(() => {
    const filters = this.activeFilters();
    const clientId = this.auth.currentUser()?.clientId;
    return this.systemService.systems().filter(s =>
      filters.includes(s.status) && (!clientId || s.clientId === clientId)
    );
  });

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  toggleFilter(value: string): void {
    const current = this.activeFilters();
    if (current.includes(value)) {
      if (current.length > 1) {
        this.activeFilters.set(current.filter(f => f !== value));
      }
    } else {
      this.activeFilters.set([...current, value]);
    }
    this.updateMarkers();
  }

  private initMap(): void {
    // Fix Leaflet default icon paths
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('system-map').setView([55, -114], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const systems = this.filteredSystems();
    const bounds: L.LatLngExpression[] = [];

    for (const sys of systems) {
      const color = this.statusMarkerColor(sys.status);
      const client = this.clientService.getById(sys.clientId);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const popupId = `popup-link-${sys.id}`;
      const marker = L.marker([sys.location.lat, sys.location.lng], { icon })
        .addTo(this.map!)
        .bindPopup(`
          <div style="min-width:200px;font-family:system-ui;">
            <p style="font-weight:600;margin:0 0 4px;">${sys.name}</p>
            <p style="color:#666;font-size:12px;margin:0 0 2px;">${client?.name ?? 'Unknown Client'}</p>
            <p style="color:#666;font-size:12px;margin:0 0 8px;">${sys.type.charAt(0).toUpperCase() + sys.type.slice(1)} &bull; ${sys.province}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;background:${color}20;color:${color};">${sys.status.charAt(0).toUpperCase() + sys.status.slice(1)}</span>
              <a id="${popupId}" href="javascript:void(0)" style="font-size:12px;font-weight:500;color:#0d9488;text-decoration:none;cursor:pointer;">View Details &rarr;</a>
            </div>
          </div>
        `);

      marker.on('popupopen', () => {
        document.getElementById(popupId)?.addEventListener('click', () => {
          this.router.navigate(['/systems', sys.id]);
        });
      });

      this.markers.push(marker);
      bounds.push([sys.location.lat, sys.location.lng]);
    }

    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 8 });
    }
  }

  private statusMarkerColor(status: string): string {
    const map: Record<string, string> = {
      healthy: '#16a34a',
      attention: '#d97706',
      critical: '#dc2626',
      offline: '#9ca3af',
    };
    return map[status] ?? '#9ca3af';
  }
}
