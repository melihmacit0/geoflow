import { Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Car, CityDetail, Flight, Hotel, SavedTrip } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';
import { PricePipe } from '../../core/price.pipe';

type Tab = 'culture' | 'book';
type CultureSub = 'overview' | 'food' | 'history' | 'tips';
type BookStep = 'flight' | 'hotel' | 'car' | 'summary';

// A trip the user tried to save while logged out, replayed after they sign in.
const PENDING_TRIP_KEY = 'geoflow_pending_trip';
// A saved trip opened from the Saved page, whose selections we restore on load.
const RESTORE_TRIP_KEY = 'geoflow_restore_trip';

@Component({
  selector: 'gf-city-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, PricePipe],
  templateUrl: './city-detail.component.html'
})
export class CityDetailComponent implements OnDestroy {
  @ViewChild('mapEl') set mapEl(el: ElementRef<HTMLDivElement> | undefined) {
    if (el && !this.map) this.initMap(el.nativeElement);
  }

  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private map?: L.Map;
  private marker?: L.Marker;

  city    = signal<CityDetail | null>(null);
  loading = signal(true);

  tab        = signal<Tab>('culture');
  cultureSub = signal<CultureSub>('overview');

  // Booking wizard
  readonly bookStepOrder: BookStep[] = ['flight', 'hotel', 'car', 'summary'];
  bookStep       = signal<BookStep>('flight');
  selectedFlight = signal<Flight | null>(null);
  selectedHotel  = signal<Hotel | null>(null);
  selectedCar    = signal<Car | null>(null);
  bookStepIndex  = computed(() => this.bookStepOrder.indexOf(this.bookStep()));

  // Flight data
  flights        = signal<Flight[]>([]);
  flightSource   = signal('');
  flightsLoading = signal(false);
  flightFilter   = signal<'cheapest' | 'fastest' | 'direct'>('cheapest');
  departureDate  = signal(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));

  // Departure airport picker
  origin            = signal('IST');
  originCity        = signal('Istanbul');
  originSearch      = signal('');
  originResults     = signal<{ iata: string; city: string; name: string; country: string }[]>([]);
  showOriginPicker  = signal(false);
  originSearchTimer: ReturnType<typeof setTimeout> | null = null;

  // Hotel data
  hotels        = signal<Hotel[]>([]);
  hotelSource   = signal('');
  hotelsLoading = signal(false);
  checkIn  = signal(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  checkOut = signal(new Date(Date.now() + 33 * 86_400_000).toISOString().slice(0, 10));
  adults   = signal(1);
  children = signal(0);

  // Car data
  cars        = signal<Car[]>([]);
  carsSource  = signal('');
  carsLoading = signal(false);

  // Mobile map toggle
  showMapMobile = signal(false);

  // Trip save state
  tripSaved       = signal(false);
  tripSaveLoading = signal(false);
  savedTripId     = signal<string | null>(null);
  tripSaveError   = signal<string | null>(null);

  // Derived booking values
  nightsCount = computed(() => {
    const ci = new Date(this.checkIn());
    const co = new Date(this.checkOut());
    return Math.max(1, Math.round((co.getTime() - ci.getTime()) / 86_400_000));
  });

  rooms = computed(() => Math.ceil(this.adults() / 2));

  totalEstimate = computed(() => {
    const n  = this.nightsCount();
    const sf = this.selectedFlight();
    return (sf ? this.flightTotal(sf.price) : 0)
      + (this.selectedHotel() ? this.selectedHotel()!.pricePerNight * n * this.rooms() : 0)
      + (this.selectedCar()   ? this.selectedCar()!.pricePerDay * n   : 0);
  });

  private countryCode = '';

  constructor() {
    // Default the departure airport to the user's saved home-airport preference
    // (format "City — IATA", e.g. "Istanbul — IST").
    const home = this.auth.user()?.homeAirport;
    if (home) {
      const [homeCity, homeCode] = home.split('—').map((s) => s.trim());
      if (homeCode) { this.origin.set(homeCode); this.originCity.set(homeCity || homeCode); }
    }

    this.route.paramMap.subscribe((params) => {
      this.countryCode = params.get('code')!.toUpperCase();
      const iata = params.get('iata')!.toUpperCase();
      this.loadCity(iata);
    });

    effect(() => {
      const c = this.city();
      if (c && this.map) {
        this.map.setView([c.lat, c.lng], 10, { animate: true });
        this.placeMarker(c);
      }
    });
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private loadCity(iata: string): void {
    this.loading.set(true);
    this.bookStep.set('flight');
    this.selectedFlight.set(null);
    this.selectedHotel.set(null);
    this.selectedCar.set(null);
    this.flights.set([]);
    this.hotels.set([]);
    this.cars.set([]);
    this.tripSaved.set(false);
    this.tripSaveLoading.set(false);
    this.savedTripId.set(null);
    this.tripSaveError.set(null);
    this.api.getCityDetail(iata).subscribe({
      next: (c) => { this.city.set(c); this.loading.set(false); this.resumePendingTrip(); this.restoreSavedTrip(); },
      error: () => { this.loading.set(false); this.router.navigate(['/country', this.countryCode]); }
    });
  }

  switchTab(t: Tab): void {
    this.tab.set(t);
    const iata = this.city()?.iata;
    if (!iata) return;
    if (t === 'book' && !this.flights().length) this.fetchFlights(iata);
  }

  // ── Booking wizard ──────────────────────────────────────────────────────────

  selectFlight(f: Flight): void {
    this.selectedFlight.set(f);
    const dep = this.departureDate();
    const co  = new Date(new Date(dep).getTime() + 3 * 86_400_000).toISOString().slice(0, 10);
    this.checkIn.set(dep);
    this.checkOut.set(co);
    this.hotels.set([]);
    this.fetchHotels();
    this.bookStep.set('hotel');
  }

  selectHotel(h: Hotel): void {
    this.selectedHotel.set(h);
    this.cars.set([]);
    this.fetchCars();
    this.bookStep.set('car');
  }

  selectCar(car: Car): void {
    this.selectedCar.set(car);
    this.bookStep.set('summary');
  }

  goBackToStep(step: BookStep): void {
    const target = this.bookStepOrder.indexOf(step);
    if (target >= this.bookStepIndex()) return;
    if (target <= 0) { this.selectedFlight.set(null); this.hotels.set([]); this.cars.set([]); }
    if (target <= 1) { this.selectedHotel.set(null); this.cars.set([]); }
    if (target <= 2) { this.selectedCar.set(null); }
    this.bookStep.set(step);
  }

  skipStep(): void {
    const current = this.bookStep();
    if (current === 'flight') {
      this.selectedFlight.set(null);
      this.hotels.set([]);
      this.fetchHotels();
      this.bookStep.set('hotel');
    } else if (current === 'hotel') {
      this.selectedHotel.set(null);
      this.cars.set([]);
      this.fetchCars();
      this.bookStep.set('car');
    } else if (current === 'car') {
      this.selectedCar.set(null);
      this.bookStep.set('summary');
    }
  }

  // ── Data fetching ────────────────────────────────────────────────────────────

  fetchFlights(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.flightsLoading.set(true);
    this.api.getCityFlights(code, { departureDate: this.departureDate(), adults: this.adults(), origin: this.origin() }).subscribe({
      next: (r) => { this.flights.set(r.flights); this.flightSource.set(r.source); this.flightsLoading.set(false); },
      error: () => this.flightsLoading.set(false)
    });
  }

  onOriginInput(q: string): void {
    this.originSearch.set(q);
    if (this.originSearchTimer) clearTimeout(this.originSearchTimer);
    if (q.length < 2) { this.originResults.set([]); return; }
    this.originSearchTimer = setTimeout(() => {
      this.api.searchAirports(q).subscribe((r) => this.originResults.set(r));
    }, 250);
  }

  selectOrigin(ap: { iata: string; city: string }): void {
    this.origin.set(ap.iata);
    this.originCity.set(ap.city);
    this.originSearch.set('');
    this.originResults.set([]);
    this.showOriginPicker.set(false);
  }

  fetchHotels(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.hotelsLoading.set(true);
    this.api.getCityHotels(code, { checkIn: this.checkIn(), checkOut: this.checkOut(), adults: this.adults() }).subscribe({
      next: (r) => { this.hotels.set(r.hotels); this.hotelSource.set(r.source); this.hotelsLoading.set(false); },
      error: () => this.hotelsLoading.set(false)
    });
  }

  fetchCars(iata?: string): void {
    const code = iata ?? this.city()?.iata;
    if (!code) return;
    this.carsLoading.set(true);
    this.api.getCityCars(code).subscribe({
      next: (r) => { this.cars.set(r.cars); this.carsSource.set(r.source); this.carsLoading.set(false); },
      error: () => this.carsLoading.set(false)
    });
  }

  get filteredFlights(): Flight[] {
    const list = [...this.flights()];
    if (this.flightFilter() === 'direct') return list.filter((f) => f.stops === 'Direct');
    if (this.flightFilter() === 'fastest') return list.sort((a, b) => this.toMins(a.duration) - this.toMins(b.duration));
    return list.sort((a, b) => a.price - b.price);
  }

  private toMins(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
  }

  private initMap(el: HTMLDivElement): void {
    this.map = L.map(el, { center: [20, 0], zoom: 8, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(this.map);
    const c = this.city();
    if (c) { this.map.setView([c.lat, c.lng], 10); this.placeMarker(c); }
  }

  private placeMarker(c: CityDetail): void {
    if (!this.map) return;
    if (this.marker) this.marker.remove();
    const icon = L.divIcon({
      className: 'geoflow-marker',
      html: `<div style="position:relative;">
          <span style="position:absolute;width:36px;height:36px;left:-18px;top:-18px;border-radius:9999px;background:#2D4677;opacity:0.15;animation:gfpulse 2s infinite;"></span>
          <span style="position:absolute;width:14px;height:14px;left:-7px;top:-7px;border-radius:9999px;background:#2D4677;border:3px solid #fff;box-shadow:0 2px 8px rgba(15,44,92,0.4);"></span>
        </div>`,
      iconSize: [0, 0]
    });
    this.marker = L.marker([c.lat, c.lng], { icon }).addTo(this.map);
    this.marker.bindPopup(`<b>${c.city}</b><br>${c.iata}`).openPopup();
  }

  flightTotal(basePrice: number): number {
    return basePrice * (this.adults() + this.children());
  }

  get passengerLabel(): string {
    const a = this.adults();
    const c = this.children();
    return c === 0
      ? `${a} Adult${a > 1 ? 's' : ''}`
      : `${a} Adult${a > 1 ? 's' : ''} · ${c} Child${c > 1 ? 'ren' : ''}`;
  }

  private buildTripPayload(): Omit<SavedTrip, 'id' | 'savedAt'> | null {
    const c = this.city();
    if (!c) return null;
    return {
      cityIata: c.iata,
      cityName: c.city,
      countryCode: this.countryCode,
      countryName: c.countryName,
      flight: this.selectedFlight(),
      hotel: this.selectedHotel(),
      car: this.selectedCar(),
      departureDate: this.departureDate(),
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      adults: this.adults(),
      children: this.children(),
      totalEstimate: this.totalEstimate()
    };
  }

  toggleSaveTrip(): void {
    if (this.tripSaveLoading()) return;
    this.tripSaveError.set(null);

    // Not signed in: stash this trip and resume the save right after login,
    // returning the user to this exact page instead of starting over.
    if (!this.auth.isLoggedIn) {
      const payload = this.buildTripPayload();
      if (payload) sessionStorage.setItem(PENDING_TRIP_KEY, JSON.stringify(payload));
      this.router.navigate(['/signin'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.tripSaveLoading.set(true);

    if (this.tripSaved()) {
      const id = this.savedTripId();
      if (!id) { this.tripSaveLoading.set(false); return; }
      this.api.removeTrip(id).subscribe({
        next: () => { this.tripSaved.set(false); this.savedTripId.set(null); this.tripSaveLoading.set(false); },
        error: (err: HttpErrorResponse) => { this.tripSaveError.set(`Remove failed (${err.status})`); this.tripSaveLoading.set(false); }
      });
      return;
    }

    const payload = this.buildTripPayload();
    if (!payload) { this.tripSaveLoading.set(false); return; }

    this.api.saveTrip(payload).subscribe({
      next: (trip) => { this.tripSaved.set(true); this.savedTripId.set(trip.id); this.tripSaveLoading.set(false); },
      error: (err: HttpErrorResponse) => {
        const msg = err.status === 401
          ? 'Session expired — please sign in again.'
          : err.status === 0
          ? 'Cannot reach server. Is the backend running?'
          : `Save failed (${err.status}): ${err.error?.error || err.message}`;
        this.tripSaveError.set(msg);
        this.tripSaveLoading.set(false);
        if (err.status === 401) this.router.navigate(['/signin']);
      }
    });
  }

  /** Restore a trip's flight/hotel/car selections into the booking summary. */
  private applyTripSelections(trip: Omit<SavedTrip, 'id' | 'savedAt'>): void {
    this.selectedFlight.set(trip.flight ?? null);
    this.selectedHotel.set(trip.hotel ?? null);
    this.selectedCar.set(trip.car ?? null);
    if (trip.departureDate) this.departureDate.set(trip.departureDate);
    if (trip.checkIn) this.checkIn.set(trip.checkIn);
    if (trip.checkOut) this.checkOut.set(trip.checkOut);
    if (trip.adults) this.adults.set(trip.adults);
    if (typeof trip.children === 'number') this.children.set(trip.children);
    this.tab.set('book');
    this.bookStep.set('summary');
  }

  /** After signing in, restore the in-progress trip and finish saving it. */
  private resumePendingTrip(): void {
    if (!this.auth.isLoggedIn) return;
    const raw = sessionStorage.getItem(PENDING_TRIP_KEY);
    if (!raw) return;

    let pending: Omit<SavedTrip, 'id' | 'savedAt'>;
    try { pending = JSON.parse(raw); } catch { sessionStorage.removeItem(PENDING_TRIP_KEY); return; }
    if (!pending || pending.cityIata !== this.city()?.iata) return;
    sessionStorage.removeItem(PENDING_TRIP_KEY);

    this.applyTripSelections(pending);
    this.toggleSaveTrip();
  }

  /** Open an already-saved trip (from the Saved page) with its selections shown. */
  private restoreSavedTrip(): void {
    const raw = sessionStorage.getItem(RESTORE_TRIP_KEY);
    if (!raw) return;

    let trip: SavedTrip;
    try { trip = JSON.parse(raw); } catch { sessionStorage.removeItem(RESTORE_TRIP_KEY); return; }
    if (!trip || trip.cityIata !== this.city()?.iata) return;
    sessionStorage.removeItem(RESTORE_TRIP_KEY);

    this.applyTripSelections(trip);
    // It's already saved — reflect that so the summary shows the saved state.
    this.tripSaved.set(true);
    this.savedTripId.set(trip.id);
  }

  toggleMapMobile(): void {
    this.showMapMobile.update(v => !v);
    setTimeout(() => this.map?.invalidateSize(), 310);
  }

  back(): void { this.router.navigate(['/country', this.countryCode]); }
}
