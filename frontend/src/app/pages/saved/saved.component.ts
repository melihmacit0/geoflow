import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { SavedTrip } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';
import { FooterComponent } from '../../shared/footer.component';

@Component({
  selector: 'gf-saved',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, FooterComponent],
  templateUrl: './saved.component.html'
})
export class SavedComponent {
  private api    = inject(ApiService);
  private router = inject(Router);

  trips        = signal<SavedTrip[]>([]);
  loading      = signal(true);
  compareMode  = signal(false);
  selectedIds  = signal<string[]>([]);
  showModal    = signal(false);

  compareTrips = computed(() =>
    this.trips().filter((t) => this.selectedIds().includes(t.id))
  );

  canCompare = computed(() => this.compareTrips().length >= 2);

  constructor() {
    this.api.getTrips().subscribe({
      next: (list) => { this.trips.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCity(trip: SavedTrip): void {
    this.router.navigate(['/country', trip.countryCode, 'city', trip.cityIata]);
  }

  remove(id: string, event: Event): void {
    event.stopPropagation();
    this.api.removeTrip(id).subscribe(() => {
      this.trips.set(this.trips().filter((t) => t.id !== id));
      this.selectedIds.set(this.selectedIds().filter((sid) => sid !== id));
    });
  }

  toggleCompareMode(): void {
    this.compareMode.set(!this.compareMode());
    if (!this.compareMode()) {
      this.selectedIds.set([]);
      this.showModal.set(false);
    }
  }

  toggleSelect(id: string): void {
    const current = this.selectedIds();
    if (current.includes(id)) {
      this.selectedIds.set(current.filter((s) => s !== id));
    } else if (current.length < 3) {
      this.selectedIds.set([...current, id]);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  openModal(): void { this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); }

  nightsCount(trip: SavedTrip): number {
    const ci = new Date(trip.checkIn);
    const co = new Date(trip.checkOut);
    return Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86_400_000));
  }

  flightTotal(trip: SavedTrip): number {
    if (!trip.flight) return 0;
    return trip.flight.price * (trip.adults + trip.children);
  }

  hotelTotal(trip: SavedTrip): number {
    if (!trip.hotel) return 0;
    const rooms = Math.ceil(trip.adults / 2);
    return trip.hotel.pricePerNight * this.nightsCount(trip) * rooms;
  }

  carTotal(trip: SavedTrip): number {
    if (!trip.car) return 0;
    return trip.car.pricePerDay * this.nightsCount(trip);
  }

  passengerLabel(trip: SavedTrip): string {
    const a = trip.adults;
    const c = trip.children;
    return c === 0
      ? `${a} Adult${a > 1 ? 's' : ''}`
      : `${a} Adult${a > 1 ? 's' : ''} · ${c} Child${c > 1 ? 'ren' : ''}`;
  }

  bestValue(): SavedTrip | null {
    const trips = this.compareTrips();
    if (trips.length < 2) return null;
    return trips.reduce((best, t) => t.totalEstimate < best.totalEstimate ? t : best);
  }
}
