import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Car, CarResponse } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-cars',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './cars.component.html'
})
export class CarsComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  code = signal('');
  response = signal<CarResponse | null>(null);
  loading = signal(true);
  sortBy = signal<'price' | 'category'>('price');
  filterTransmission = signal<'all' | 'Manual' | 'Automatic'>('all');

  get isLiveData(): boolean { return this.response()?.source === 'live'; }

  pickupDate = signal('');
  dropoffDate = signal('');
  drivers = signal(1);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code')!;
      this.code.set(code);
      this.load(code);
    });
  }

  private load(code: string, params?: { pickupDate?: string; dropoffDate?: string; drivers?: number }): void {
    this.loading.set(true);
    this.api.getCars(code, params).subscribe({
      next: (res) => {
        this.response.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/discover']);
      }
    });
  }

  search(): void {
    this.load(this.code(), {
      pickupDate: this.pickupDate() || undefined,
      dropoffDate: this.dropoffDate() || undefined,
      drivers: this.drivers()
    });
  }

  get filteredCars(): Car[] {
    let list = [...(this.response()?.cars ?? [])];
    if (this.filterTransmission() !== 'all') {
      list = list.filter((c) => c.transmission === this.filterTransmission());
    }
    switch (this.sortBy()) {
      case 'category': return list.sort((a, b) => a.category.localeCompare(b.category));
      default:         return list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
  }

  back(): void {
    this.router.navigate(['/country', this.code()]);
  }
}
