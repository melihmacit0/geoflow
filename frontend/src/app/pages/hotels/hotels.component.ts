import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Hotel, HotelResponse } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-hotels',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent],
  templateUrl: './hotels.component.html'
})
export class HotelsComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  code = signal('');
  response = signal<HotelResponse | null>(null);
  loading = signal(true);
  sortBy = signal<'price' | 'rating' | 'stars'>('price');

  get isLiveData(): boolean { return this.response()?.source?.startsWith('live') ?? false; }

  checkIn = signal('');
  checkOut = signal('');
  adults = signal(1);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code')!;
      this.code.set(code);
      this.load(code);
    });
  }

  private load(code: string, params?: { checkIn?: string; checkOut?: string; adults?: number }): void {
    this.loading.set(true);
    this.api.getHotels(code, params).subscribe({
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
      checkIn: this.checkIn() || undefined,
      checkOut: this.checkOut() || undefined,
      adults: this.adults()
    });
  }

  get sortedHotels(): Hotel[] {
    const list = [...(this.response()?.hotels ?? [])];
    switch (this.sortBy()) {
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'stars':  return list.sort((a, b) => b.stars - a.stars);
      default:       return list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    }
  }

  starsArray(n: number): number[] {
    return Array.from({ length: n });
  }

  back(): void {
    this.router.navigate(['/country', this.code()]);
  }
}
