import { Component, inject, signal } from '@angular/core';
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

  trips   = signal<SavedTrip[]>([]);
  loading = signal(true);

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
    });
  }

  nightsCount(trip: SavedTrip): number {
    const ci = new Date(trip.checkIn);
    const co = new Date(trip.checkOut);
    return Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86_400_000));
  }
}
