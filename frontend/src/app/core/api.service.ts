import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CountryDetail,
  CountrySummary,
  FlightResponse,
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

  getFlights(code: string): Observable<FlightResponse> {
    return this.http.get<FlightResponse>(`${API}/countries/${code}/flights`);
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
