import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { City, CountryDetail } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-country-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './country-detail.component.html'
})
export class CountryDetailComponent {
  private api    = inject(ApiService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  country      = signal<CountryDetail | null>(null);
  cities       = signal<City[]>([]);
  loading      = signal(true);
  citiesLoading = signal(true);
  searchQuery  = signal('');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code')!.toUpperCase();
      this.loadAll(code);
    });
  }

  private loadAll(code: string): void {
    this.loading.set(true);
    this.citiesLoading.set(true);

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

  close(): void {
    this.router.navigate(['/discover']);
  }
}
