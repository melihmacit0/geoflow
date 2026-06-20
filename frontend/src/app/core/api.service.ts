import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CarResponse, City, CityDetail, CountryDetail, CountrySummary,
  FlightResponse, HotelResponse, SavedDestination, SavedTrip
} from './models';

// Relative path: same-origin in production (Vercel), proxied to :4000 in local dev.
const API = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── Countries ─────────────────────────────────────────────────────────────

  getCountries(filters?: { continent?: string }): Observable<CountrySummary[]> {
    const params: Record<string, string> = {};
    if (filters?.continent) params['continent'] = filters.continent;
    return this.http.get<CountrySummary[]>(`${API}/countries`, { params });
  }

  getCountry(code: string): Observable<CountryDetail> {
    return this.http.get<CountryDetail>(`${API}/countries/${code}`);
  }

  getCities(countryCode: string): Observable<City[]> {
    return this.http.get<City[]>(`${API}/countries/${countryCode}/cities`);
  }

  // ── Cities ────────────────────────────────────────────────────────────────

  searchAirports(q: string): Observable<{ iata: string; city: string; name: string; country: string }[]> {
    return this.http.get<{ iata: string; city: string; name: string; country: string }[]>(`${API}/airports/search`, { params: { q } });
  }

  getCityDetail(iata: string): Observable<CityDetail> {
    return this.http.get<CityDetail>(`${API}/cities/${iata}`);
  }

  getCityFlights(
    iata: string,
    opts?: { departureDate?: string; origin?: string; adults?: number }
  ): Observable<FlightResponse> {
    const params: Record<string, string> = {};
    if (opts?.departureDate) params['departureDate'] = opts.departureDate;
    if (opts?.origin) params['origin'] = opts.origin;
    if (opts?.adults) params['adults'] = String(opts.adults);
    return this.http.get<FlightResponse>(`${API}/cities/${iata}/flights`, { params });
  }

  getCityHotels(
    iata: string,
    opts?: { checkIn?: string; checkOut?: string; adults?: number }
  ): Observable<HotelResponse> {
    const params: Record<string, string> = {};
    if (opts?.checkIn) params['checkIn'] = opts.checkIn;
    if (opts?.checkOut) params['checkOut'] = opts.checkOut;
    if (opts?.adults) params['adults'] = String(opts.adults);
    return this.http.get<HotelResponse>(`${API}/cities/${iata}/hotels`, { params });
  }

  getCityCars(
    iata: string,
    opts?: { pickupDate?: string; dropoffDate?: string }
  ): Observable<CarResponse> {
    const params: Record<string, string> = {};
    if (opts?.pickupDate) params['pickupDate'] = opts.pickupDate;
    if (opts?.dropoffDate) params['dropoffDate'] = opts.dropoffDate;
    return this.http.get<CarResponse>(`${API}/cities/${iata}/cars`, { params });
  }

  // ── Saved ─────────────────────────────────────────────────────────────────

  getSaved(): Observable<SavedDestination[]> {
    return this.http.get<SavedDestination[]>(`${API}/saved`);
  }

  saveDestination(code: string): Observable<{ saved: string[] }> {
    return this.http.post<{ saved: string[] }>(`${API}/saved/${code}`, {});
  }

  removeSaved(code: string): Observable<{ saved: string[] }> {
    return this.http.delete<{ saved: string[] }>(`${API}/saved/${code}`);
  }

  // ── Trips ──────────────────────────────────────────────────────────────────

  getTrips(): Observable<SavedTrip[]> {
    return this.http.get<SavedTrip[]>(`${API}/trips`);
  }

  saveTrip(trip: Omit<SavedTrip, 'id' | 'savedAt'>): Observable<SavedTrip> {
    return this.http.post<SavedTrip>(`${API}/trips`, trip);
  }

  removeTrip(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${API}/trips/${id}`);
  }
}
