import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CountryDetail, CountrySummary } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-compare',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './compare.component.html'
})
export class CompareComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private map?: L.Map;
  private markerLayer = L.layerGroup();

  selected     = signal<CountryDetail[]>([]);
  allCountries = signal<CountrySummary[]>([]);
  showPicker   = signal(false);
  loading      = signal(true);
  noTrips      = signal(false);

  get isLoggedIn(): boolean { return this.auth.isLoggedIn; }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [25, 20],
      zoom: 2,
      minZoom: 2,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
    this.markerLayer.addTo(this.map);

    this.api.getCountries().subscribe((list) => this.allCountries.set(list));

    if (!this.auth.isLoggedIn) {
      this.loading.set(false);
      return;
    }

    // Load countries from saved trips (unique country codes)
    this.api.getTrips().subscribe({
      next: (trips) => {
        const uniqueCodes = [...new Set(trips.map((t) => t.countryCode))];
        if (uniqueCodes.length === 0) {
          this.noTrips.set(true);
          this.loading.set(false);
          return;
        }
        this.loadCodes(uniqueCodes);
      },
      error: () => { this.loading.set(false); }
    });
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private loadCodes(codes: string[]): void {
    forkJoin(codes.map((c) => this.api.getCountry(c))).subscribe((details) => {
      this.selected.set(details);
      this.loading.set(false);
      this.renderMarkers();
    });
  }

  private renderMarkers(): void {
    this.markerLayer.clearLayers();
    const pts: [number, number][] = [];
    this.selected().forEach((c) => {
      pts.push([c.lat, c.lng]);
      const icon = L.divIcon({
        className: 'geoflow-marker',
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-100%);">
            <div style="background:${c.accent};padding:6px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 8px rgba(15,44,92,0.4);">
              <span style="display:block;width:8px;height:8px;border-radius:9999px;background:#fff;"></span>
            </div>
            <div style="background:#fff;padding:2px 8px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.15);margin-top:4px;font-size:10px;font-weight:700;letter-spacing:0.08em;color:${c.accent};">${c.name.toUpperCase()}</div>
          </div>`,
        iconSize: [0, 0]
      });
      L.marker([c.lat, c.lng], { icon }).addTo(this.markerLayer);
    });
    if (pts.length && this.map) {
      this.map.fitBounds(L.latLngBounds(pts).pad(0.4), { animate: true });
    }
  }

  get available(): CountrySummary[] {
    const codes = new Set(this.selected().map((s) => s.code));
    return this.allCountries().filter((c) => !codes.has(c.code));
  }

  add(code: string): void {
    this.showPicker.set(false);
    this.api.getCountry(code).subscribe((d) => {
      this.selected.set([...this.selected(), d]);
      this.renderMarkers();
    });
  }

  removeCountry(code: string): void {
    this.selected.set(this.selected().filter((s) => s.code !== code));
    this.renderMarkers();
  }

  clearAll(): void {
    this.selected.set([]);
    this.markerLayer.clearLayers();
  }

  open(code: string): void {
    this.router.navigate(['/country', code]);
  }

  // ── Best-value helpers ────────────────────────────────────────────────────
  private minutes(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : Number.MAX_SAFE_INTEGER;
  }

  isCheapestFlight(c: CountryDetail): boolean {
    const vals = this.selected().map((s) => s.cheapestFlight ?? Infinity);
    return (c.cheapestFlight ?? Infinity) === Math.min(...vals);
  }

  isFastest(c: CountryDetail): boolean {
    const vals = this.selected().map((s) => this.minutes(s.comparison?.flightDuration ?? ''));
    return this.minutes(c.comparison?.flightDuration ?? '') === Math.min(...vals);
  }

  isCheapestBudget(c: CountryDetail): boolean {
    const vals = this.selected().map((s) => s.comparison?.dailyBudget ?? Infinity);
    return (c.comparison?.dailyBudget ?? Infinity) === Math.min(...vals);
  }
}
