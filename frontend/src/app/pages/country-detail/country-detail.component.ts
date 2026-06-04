import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CountryDetail, Flight } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-country-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './country-detail.component.html'
})
export class CountryDetailComponent implements OnDestroy {
  @ViewChild('mapEl') set mapEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (el && !this.map) {
      this.initMap(el.nativeElement);
    }
  }

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private map?: L.Map;

  country = signal<CountryDetail | null>(null);
  flights = signal<Flight[]>([]);
  flightSource = signal<string>('');
  tab = signal<'culture' | 'flights'>('culture');
  flightFilter = signal<'cheapest' | 'fastest' | 'direct'>('cheapest');
  saved = signal(false);
  loading = signal(true);
  flightsLoading = signal(false);

  // Default departure: 30 days from today
  departureDate = signal(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code')!;
      this.loadCountry(code);
    });

    // Re-center the map whenever the country resolves.
    effect(() => {
      const c = this.country();
      if (c && this.map) {
        this.map.setView([c.lat, c.lng], 5, { animate: true });
        this.placeMarker(c);
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private loadCountry(code: string): void {
    this.loading.set(true);
    this.api.getCountry(code).subscribe({
      next: (c) => {
        this.country.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/discover']);
      }
    });
    this.fetchFlights(code);
    if (this.auth.isLoggedIn) {
      this.api.getSaved().subscribe((list) => this.saved.set(list.some((s) => s.code === code)));
    }
  }

  fetchFlights(code?: string): void {
    const c = code ?? this.country()?.code;
    if (!c) return;
    this.flightsLoading.set(true);
    this.api.getFlights(c, { departureDate: this.departureDate() }).subscribe((res) => {
      this.flights.set(res.flights);
      this.flightSource.set(res.source);
      this.flightsLoading.set(false);
    });
  }

  get isLiveData(): boolean {
    return this.flightSource().startsWith('live');
  }

  private initMap(el: HTMLDivElement): void {
    this.map = L.map(el, {
      center: [20, 0],
      zoom: 4,
      zoomControl: false,
      attributionControl: false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
    const c = this.country();
    if (c) {
      this.map.setView([c.lat, c.lng], 5);
      this.placeMarker(c);
    }
  }

  private marker?: L.Marker;
  private placeMarker(c: CountryDetail): void {
    if (!this.map) return;
    if (this.marker) this.marker.remove();
    const icon = L.divIcon({
      className: 'geoflow-marker',
      html: `<div style="position:relative;">
          <span style="position:absolute;width:40px;height:40px;left:-20px;top:-20px;border-radius:9999px;background:${c.accent}33;animation:gfpulse 2s infinite;"></span>
          <span style="position:absolute;width:16px;height:16px;left:-8px;top:-8px;border-radius:9999px;background:${c.accent};border:3px solid #fff;box-shadow:0 2px 8px rgba(15,44,92,0.4);"></span>
        </div>`,
      iconSize: [0, 0]
    });
    this.marker = L.marker([c.lat, c.lng], { icon }).addTo(this.map);
  }

  get filteredFlights(): Flight[] {
    const list = [...this.flights()];
    switch (this.flightFilter()) {
      case 'direct':
        return list.filter((f) => f.stops === 'Direct');
      case 'fastest':
        return list.sort((a, b) => this.toMinutes(a.duration) - this.toMinutes(b.duration));
      default:
        return list.sort((a, b) => a.price - b.price);
    }
  }

  private toMinutes(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
  }

  toggleSave(): void {
    const c = this.country();
    if (!c) return;
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/signin']);
      return;
    }
    if (this.saved()) {
      this.api.removeSaved(c.code).subscribe(() => this.saved.set(false));
    } else {
      this.api.saveDestination(c.code).subscribe(() => this.saved.set(true));
    }
  }

  close(): void {
    this.router.navigate(['/discover']);
  }
}
