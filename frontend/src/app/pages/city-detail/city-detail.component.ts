import { Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { Car, CityDetail, Flight, Hotel } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

type Tab = 'culture' | 'flights' | 'hotels' | 'cars';
type CultureSub = 'overview' | 'food' | 'history' | 'tips';

@Component({
  selector: 'gf-city-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './city-detail.component.html'
})
export class CityDetailComponent implements OnDestroy {
  @ViewChild('mapEl') set mapEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (el && !this.map) this.initMap(el.nativeElement);
  }

  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private map?: L.Map;
  private marker?: L.Marker;

  city    = signal<CityDetail | null>(null);
  loading = signal(true);

  tab = signal<Tab>('culture');
  cultureSub = signal<CultureSub>('overview');

  // Flights
  flights       = signal<Flight[]>([]);
  flightSource  = signal('');
  flightsLoading = signal(false);
  flightFilter  = signal<'cheapest' | 'fastest' | 'direct'>('cheapest');
  departureDate = signal(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));

  // Hotels
  hotels        = signal<Hotel[]>([]);
  hotelSource   = signal('');
  hotelsLoading = signal(false);
  checkIn  = signal(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  checkOut = signal(new Date(Date.now() + 33 * 86_400_000).toISOString().slice(0, 10));
  adults   = signal(1);

  // Cars
  cars       = signal<Car[]>([]);
  carsSource = signal('');
  carsLoading = signal(false);

  private countryCode = '';

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.countryCode = params.get('code')!.toUpperCase();
      const iata = params.get('iata')!.toUpperCase();
      this.loadCity(iata);
    });

    effect(() => {
      const c = this.city();
      if (c && this.map) {
        this.map.setView([c.lat, c.lng], 10, { animate: true });
        this.placeMarker(c);
      }
    });
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private loadCity(iata: string): void {
    this.loading.set(true);
    this.api.getCityDetail(iata).subscribe({
      next: (c) => { this.city.set(c); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/country', this.countryCode]); }
    });
  }

  switchTab(t: Tab): void {
    this.tab.set(t);
    const iata = this.city()?.iata;
    if (!iata) return;
    if (t === 'flights' && !this.flights().length) this.fetchFlights(iata);
    if (t === 'hotels' && !this.hotels().length) this.fetchHotels(iata);
    if (t === 'cars' && !this.cars().length) this.fetchCars(iata);
  }

  fetchFlights(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.flightsLoading.set(true);
    this.api.getCityFlights(code, { departureDate: this.departureDate(), adults: this.adults() }).subscribe({
      next: (r) => { this.flights.set(r.flights); this.flightSource.set(r.source); this.flightsLoading.set(false); },
      error: () => this.flightsLoading.set(false)
    });
  }

  fetchHotels(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.hotelsLoading.set(true);
    this.api.getCityHotels(code, { checkIn: this.checkIn(), checkOut: this.checkOut(), adults: this.adults() }).subscribe({
      next: (r) => { this.hotels.set(r.hotels); this.hotelSource.set(r.source); this.hotelsLoading.set(false); },
      error: () => this.hotelsLoading.set(false)
    });
  }

  fetchCars(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.carsLoading.set(true);
    this.api.getCityCars(code).subscribe({
      next: (r) => { this.cars.set(r.cars); this.carsSource.set(r.source); this.carsLoading.set(false); },
      error: () => this.carsLoading.set(false)
    });
  }

  get isLive(): boolean { return this.flightSource().startsWith('live') || this.hotelSource().startsWith('live'); }

  get filteredFlights(): Flight[] {
    const list = [...this.flights()];
    if (this.flightFilter() === 'direct') return list.filter((f) => f.stops === 'Direct');
    if (this.flightFilter() === 'fastest') return list.sort((a, b) => this.toMins(a.duration) - this.toMins(b.duration));
    return list.sort((a, b) => a.price - b.price);
  }

  private toMins(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
  }

  private initMap(el: HTMLDivElement): void {
    this.map = L.map(el, { center: [20, 0], zoom: 8, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(this.map);
    const c = this.city();
    if (c) { this.map.setView([c.lat, c.lng], 10); this.placeMarker(c); }
  }

  private placeMarker(c: CityDetail): void {
    if (!this.map) return;
    if (this.marker) this.marker.remove();
    const icon = L.divIcon({
      className: 'geoflow-marker',
      html: `<div style="position:relative;">
          <span style="position:absolute;width:36px;height:36px;left:-18px;top:-18px;border-radius:9999px;background:#2D4677;opacity:0.15;animation:gfpulse 2s infinite;"></span>
          <span style="position:absolute;width:14px;height:14px;left:-7px;top:-7px;border-radius:9999px;background:#2D4677;border:3px solid #fff;box-shadow:0 2px 8px rgba(15,44,92,0.4);"></span>
        </div>`,
      iconSize: [0, 0]
    });
    this.marker = L.marker([c.lat, c.lng], { icon }).addTo(this.map);
    this.marker.bindPopup(`<b>${c.city}</b><br>${c.iata}`).openPopup();
  }

  back(): void { this.router.navigate(['/country', this.countryCode]); }
}
