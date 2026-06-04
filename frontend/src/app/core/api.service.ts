import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CarResponse,
  CountryDetail,
  CountrySummary,
  FlightResponse,
  HotelResponse,
  SavedDestination
} from './models';

const API = 'http://localhost:4000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getCountries(filters?: { continent?: string; interest?: string }): Observable<CountrySummary[]> {
    let params: Record<string, string> = {};
    if (filters?.continent) params['continent'] = filters.continent;
    if (filters?.interest) params['interest'] = filters.interest;
    return this.http.get<CountrySummary[]>(`${API}/countries`, { params });
  }

  getCountry(code: string): Observable<CountryDetail> {
    return this.http.get<CountryDetail>(`${API}/countries/${code}`);
  }

  getFlights(
    code: string,
    opts?: { departureDate?: string; origin?: string; adults?: number }
  ): Observable<FlightResponse> {
    const params: Record<string, string> = {};
    if (opts?.departureDate) params['departureDate'] = opts.departureDate;
    if (opts?.origin) params['origin'] = opts.origin;
    if (opts?.adults) params['adults'] = String(opts.adults);
    return this.http.get<FlightResponse>(`${API}/countries/${code}/flights`, { params });
  }

  getHotels(code: string, params?: { checkIn?: string; checkOut?: string; adults?: number }): Observable<HotelResponse> {
    return this.http.get<HotelResponse>(`${API}/countries/${code}/hotels`, { params: params as any });
  }

  getCars(code: string, params?: { pickupDate?: string; dropoffDate?: string; drivers?: number }): Observable<CarResponse> {
    return this.http.get<CarResponse>(`${API}/countries/${code}/cars`, { params: params as any });
  }

  getSaved(): Observable<SavedDestination[]> {
    return this.http.get<SavedDestination[]>(`${API}/saved`);
  }

  saveDestination(code: string): Observable<{ saved: string[] }> {
    return this.http.post<{ saved: string[] }>(`${API}/saved/${code}`, {});
  }

  removeSaved(code: string): Observable<{ saved: string[] }> {
    return this.http.delete<{ saved: string[] }>(`${API}/saved/${code}`);
  }
}
