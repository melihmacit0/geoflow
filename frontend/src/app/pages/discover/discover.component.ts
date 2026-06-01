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
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { CountrySummary } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-discover',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavComponent],
  templateUrl: './discover.component.html'
})
export class DiscoverComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private router = inject(Router);

  private map?: L.Map;
  private markerLayer = L.layerGroup();

  countries = signal<CountrySummary[]>([]);
  travelers = signal(2);

  continents = ['Europe', 'Asia', 'Americas', 'Africa'];
  interests = ['History', 'Cuisine', 'Nature'];
  activeContinent = signal<string | null>('Europe');
  activeInterest = signal<string | null>('Cuisine');

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [30, 15],
      zoom: 2.5,
      minZoom: 2,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true
    });

    // Soft, light basemap (CARTO Positron) matching the editorial off-white aesthetic.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.load();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private load(): void {
    this.api.getCountries().subscribe((list) => {
      this.countries.set(list);
      this.renderMarkers(list);
    });
  }

  private renderMarkers(list: CountrySummary[]): void {
    this.markerLayer.clearLayers();
    list.forEach((c) => {
      const icon = L.divIcon({
        className: 'geoflow-marker',
        html: `<div style="position:relative;">
            <span style="position:absolute;width:26px;height:26px;left:-13px;top:-13px;border-radius:9999px;background:${c.accent}33;animation:gfpulse 2s infinite;"></span>
            <span style="position:absolute;width:12px;height:12px;left:-6px;top:-6px;border-radius:9999px;background:${c.accent};border:2px solid #fff;box-shadow:0 2px 6px rgba(15,44,92,0.3);"></span>
          </div>`,
        iconSize: [0, 0]
      });
      const marker = L.marker([c.lat, c.lng], { icon }).addTo(this.markerLayer);
      marker.bindTooltip(
        `<div style="font-weight:600;color:#00173d;">${c.flag} ${c.name}</div>
         <div style="font-size:11px;color:#747780;">From $${c.cheapestFlight}</div>`,
        { direction: 'top', offset: [0, -8] }
      );
      marker.on('click', () => this.router.navigate(['/country', c.code]));
    });
  }

  /** Trending = the four cheapest destinations. */
  get trending(): CountrySummary[] {
    return [...this.countries()].sort((a, b) => a.cheapestFlight - b.cheapestFlight).slice(0, 6);
  }

  toggleContinent(c: string): void {
    this.activeContinent.set(this.activeContinent() === c ? null : c);
  }

  toggleInterest(i: string): void {
    this.activeInterest.set(this.activeInterest() === i ? null : i);
  }

  applyFilters(): void {
    this.api
      .getCountries({
        continent: this.activeContinent() ?? undefined,
        interest: this.activeInterest() ?? undefined
      })
      .subscribe((list) => {
        this.countries.set(list);
        this.renderMarkers(list);
        if (list.length && this.map) {
          const bounds = L.latLngBounds(list.map((c) => [c.lat, c.lng] as [number, number]));
          this.map.fitBounds(bounds.pad(0.3), { animate: true });
        }
      });
  }

  zoom(delta: number): void {
    if (!this.map) return;
    this.map.setZoom(this.map.getZoom() + delta);
  }

  open(code: string): void {
    this.router.navigate(['/country', code]);
  }
}
