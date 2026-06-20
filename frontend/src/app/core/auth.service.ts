import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models';

// Relative path: same-origin in production (Vercel), proxied to :4000 in local dev.
const API = '/api';
const TOKEN_KEY = 'geoflow_token';
const USER_KEY = 'geoflow_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Current user as a signal so the shell reacts to login / logout. */
  readonly user = signal<User | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/auth/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/auth/register`, { name, email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  updateProfile(patch: Partial<User>): Observable<User> {
    return this.http.put<User>(`${API}/auth/me`, patch).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
