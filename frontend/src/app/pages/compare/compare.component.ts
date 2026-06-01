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
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { CountryDetail, CountrySummary } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-compare',
  standalone: true,
  imports: [CommonModule, TopNavComponent],
  templateUrl: './compare.component.html'
})
export class CompareComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private router = inject(Router);
  private map?: L.Map;
  private markerLayer = L.layerGroup();

  selected = signal<CountryDetail[]>([]);
  allCountries = signal<CountrySummary[]>([]);
  showPicker = signal(false);

  private defaultCodes = ['JP', 'IT', 'MA'];

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
    this.loadCodes(this.defaultCodes);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private loadCodes(codes: string[]): void {
    forkJoin(codes.map((c) => this.api.getCountry(c))).subscribe((details) => {
      this.selected.set(details);
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
    this.renderMarkers();
  }

  open(code: string): void {
    this.router.navigate(['/country', code]);
  }

  // ---- "Best value" helpers for green highlighting ----
  private minutes(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : Number.MAX_SAFE_INTEGER;
  }
  isCheapestFlight(c: CountryDetail): boolean {
    return c.cheapestFlight === Math.min(...this.selected().map((s) => s.cheapestFlight));
  }
  isFastest(c: CountryDetail): boolean {
    return (
      this.minutes(c.comparison.flightDuration) ===
      Math.min(...this.selected().map((s) => this.minutes(s.comparison.flightDuration)))
    );
  }
  isCheapestBudget(c: CountryDetail): boolean {
    return (
      c.comparison.dailyBudget ===
      Math.min(...this.selected().map((s) => s.comparison.dailyBudget))
    );
  }
}
