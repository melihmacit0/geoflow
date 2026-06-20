import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { CountrySummary } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';
import { CurrencyService } from '../../core/currency.service';
import { PricePipe } from '../../core/price.pipe';

@Component({
  selector: 'gf-discover',
  standalone: true,
  imports: [CommonModule, TopNavComponent, PricePipe],
  templateUrl: './discover.component.html'
})
export class DiscoverComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private currency = inject(CurrencyService);

  private map?: L.Map;
  private markerLayer = L.layerGroup();
  private markersByCode = new Map<string, L.Marker>();
  private searchTerm = '';

  countries = signal<CountrySummary[]>([]);

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [30, 15],
      zoom: 2.5,
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
    this.load();

    // React to ?q=… from the top-nav search box (fires on every new search).
    this.route.queryParamMap.subscribe((p) => {
      this.searchTerm = (p.get('q') || '').trim();
      this.applySearch();
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private load(): void {
    this.api.getCountries().subscribe((list) => {
      this.countries.set(list);
      this.renderMarkers(list);
      this.applySearch();
    });
  }

  /** Fly the map to the country matching the current search term. */
  private applySearch(): void {
    const q = this.searchTerm.toLowerCase();
    if (!q || !this.map || !this.countries().length) return;
    const match =
      this.countries().find((c) => c.code.toLowerCase() === q) ||
      this.countries().find((c) => c.name.toLowerCase().startsWith(q)) ||
      this.countries().find((c) => c.name.toLowerCase().includes(q));
    if (!match) return;
    this.map.flyTo([match.lat, match.lng], 5, { duration: 1 });
    const marker = this.markersByCode.get(match.code);
    if (marker) setTimeout(() => marker.openTooltip(), 650);
  }

  private renderMarkers(list: CountrySummary[]): void {
    this.markerLayer.clearLayers();
    this.markersByCode.clear();
    list.forEach((c) => {
      const icon = L.divIcon({
        className: 'geoflow-marker',
        html: `<div style="position:relative;">
            <span style="position:absolute;width:20px;height:20px;left:-10px;top:-10px;border-radius:9999px;background:${c.accent}33;animation:gfpulse 2s infinite;"></span>
            <span style="position:absolute;width:9px;height:9px;left:-4.5px;top:-4.5px;border-radius:9999px;background:${c.accent};border:2px solid #fff;box-shadow:0 2px 6px rgba(15,44,92,0.3);"></span>
          </div>`,
        iconSize: [0, 0]
      });
      const marker = L.marker([c.lat, c.lng], { icon }).addTo(this.markerLayer);
      const priceLabel = c.cheapestFlight ? `<div style="font-size:11px;color:#747780;">From ${this.currency.format(c.cheapestFlight)}</div>` : '';
      marker.bindTooltip(
        `<div style="font-weight:600;color:#00173d;">${c.flag} ${c.name}</div>${priceLabel}`,
        { direction: 'top', offset: [0, -8] }
      );
      marker.on('click', () => this.router.navigate(['/country', c.code]));
      this.markersByCode.set(c.code, marker);
    });
  }

  /** Trending = curated destinations that have an image and cheapestFlight price */
  get trending(): CountrySummary[] {
    return this.countries()
      .filter((c) => c.cheapestFlight && c.image)
      .sort((a, b) => a.cheapestFlight! - b.cheapestFlight!)
      .slice(0, 6);
  }

  zoom(delta: number): void {
    if (!this.map) return;
    this.map.setZoom(this.map.getZoom() + delta);
  }

  open(code: string): void {
    this.router.navigate(['/country', code]);
  }
}
