import { Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { City, CountryDetail } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-country-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './country-detail.component.html'
})
export class CountryDetailComponent implements OnDestroy {
  @ViewChild('mapEl') set mapEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (el && !this.map) this.initMap(el.nativeElement);
  }

  private api    = inject(ApiService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private map?: L.Map;
  private cityMarkers: L.Marker[] = [];

  country       = signal<CountryDetail | null>(null);
  cities        = signal<City[]>([]);
  loading       = signal(true);
  citiesLoading = signal(true);
  searchQuery   = signal('');
  showMapMobile = signal(false);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code')!.toUpperCase();
      this.loadAll(code);
    });

    effect(() => {
      const list = this.cities();
      if (list.length && this.map) this.placeMarkers(list);
    });
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private loadAll(code: string): void {
    this.loading.set(true);
    this.citiesLoading.set(true);
    this.cityMarkers.forEach(m => m.remove());
    this.cityMarkers = [];

    this.api.getCountry(code).subscribe({
      next: (c) => { this.country.set(c); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/discover']); }
    });

    this.api.getCities(code).subscribe({
      next: (list) => { this.cities.set(list); this.citiesLoading.set(false); },
      error: () => this.citiesLoading.set(false)
    });
  }

  get filteredCities(): City[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.cities();
    return this.cities().filter(
      (c) => c.city.toLowerCase().includes(q) || c.iata.toLowerCase().includes(q)
    );
  }

  openCity(iata: string): void {
    const code = this.country()?.code;
    if (code) this.router.navigate(['/country', code, 'city', iata]);
  }

  close(): void { this.router.navigate(['/discover']); }

  toggleMapMobile(): void {
    this.showMapMobile.update(v => !v);
    setTimeout(() => this.map?.invalidateSize(), 310);
  }

  private initMap(el: HTMLDivElement): void {
    this.map = L.map(el, { center: [20, 0], zoom: 4, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(this.map);
    const list = this.cities();
    if (list.length) this.placeMarkers(list);
  }

  private placeMarkers(cities: City[]): void {
    if (!this.map) return;
    this.cityMarkers.forEach(m => m.remove());
    this.cityMarkers = [];

    const accent = this.country()?.accent || '#2D4677';

    cities.forEach(city => {
      const large = city.type === 'large_airport';
      const size  = large ? 12 : 8;
      const icon  = L.divIcon({
        className: '',
        html: `<div style="position:relative;">
          ${large ? `<span style="position:absolute;width:28px;height:28px;left:-14px;top:-14px;border-radius:9999px;background:${accent};opacity:0.12;"></span>` : ''}
          <span style="position:absolute;width:${size}px;height:${size}px;left:-${size / 2}px;top:-${size / 2}px;border-radius:9999px;background:${accent};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></span>
        </div>`,
        iconSize: [0, 0]
      });

      const marker = L.marker([city.lat, city.lng], { icon })
        .addTo(this.map!)
        .bindPopup(`<b>${city.city}</b><br><span style="font-size:11px;color:#888">${city.iata} · ${city.name}</span>`);

      marker.on('click', () => this.openCity(city.iata));
      this.cityMarkers.push(marker);
    });

    if (cities.length === 1) {
      this.map.setView([cities[0].lat, cities[0].lng], 8);
    } else {
      const bounds = L.latLngBounds(cities.map(c => [c.lat, c.lng] as [number, number]));
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
    }
  }
}
