import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { CountrySummary } from '../core/models';

/** Shared TopAppBar used across the discovery / details / saved / compare shells. */
@Component({
  selector: 'gf-top-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-4 md:px-8 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E5E0] shadow-[0_20px_20px_rgba(15,44,92,0.04)] text-sm font-medium tracking-tight"
    >
      <div class="flex items-center gap-4 md:gap-10 min-w-0">
        <a routerLink="/" class="text-xl md:text-2xl font-bold tracking-tighter text-primary-container shrink-0">GeoFlow</a>
        @if (showSearch) {
          <div class="relative w-[420px] hidden lg:block">
            <button type="button" (click)="search()" aria-label="Search" class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-container transition-colors z-10">search</button>
            <input
              [ngModel]="query"
              (ngModelChange)="onSearchInput($event)"
              (focus)="onSearchInput(query)"
              (keyup.enter)="onEnter()"
              (blur)="hideSuggestionsSoon()"
              class="w-full h-10 pl-12 pr-4 bg-slate-50 border-none rounded-full focus:ring-1 focus:ring-primary/20 text-sm placeholder:text-slate-400"
              placeholder="Search a country…"
              type="text"
            />
            @if (showSuggestions() && suggestions().length) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[120]">
                @for (c of suggestions(); track c.code) {
                  <button type="button" (mousedown)="pickSuggestion(c)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors">
                    <span class="text-lg leading-none">{{ c.flag }}</span>
                    <span class="flex-1 text-sm text-primary truncate">{{ c.name }}</span>
                    <span class="text-[10px] text-slate-400 font-semibold tracking-wider">{{ c.code }}</span>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      <nav class="flex items-center gap-3 md:gap-8">
        <div class="hidden md:flex items-center gap-6">
          <a
            routerLink="/discover"
            routerLinkActive="text-primary-container border-b-2 border-primary-container"
            class="text-slate-500 hover:text-primary-container transition-colors pb-1"
            >Explore</a
          >
          <a
            routerLink="/saved"
            routerLinkActive="text-primary-container border-b-2 border-primary-container"
            class="text-slate-500 hover:text-primary-container transition-colors pb-1"
            >Saved</a
          >
        </div>

        <!-- Hamburger (mobile only) -->
        <button
          (click)="mobileOpen.set(!mobileOpen())"
          class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Menu"
        >
          <span class="material-symbols-outlined text-slate-700">{{ mobileOpen() ? 'close' : 'menu' }}</span>
        </button>

        <div class="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-100">
          @if (user(); as u) {
            <a
              routerLink="/profile"
              class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm cursor-pointer active:scale-95 transition-all"
              [title]="u.name"
              >{{ initials(u.name) }}</a
            >
          } @else {
            <a
              routerLink="/signin"
              class="bg-primary-container text-white px-4 md:px-5 py-2 rounded-lg hover:bg-primary transition-all active:scale-95 font-medium text-xs md:text-sm"
              >Sign In</a
            >
          }
        </div>
      </nav>
    </header>

    <!-- Mobile slide-down menu -->
    @if (mobileOpen()) {
      <div class="fixed top-16 left-0 right-0 z-[99] md:hidden bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-lg py-4 px-6 flex flex-col gap-1">
        <a routerLink="/discover" routerLinkActive="text-primary-container bg-slate-50"
          (click)="mobileOpen.set(false)"
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary-container transition-colors font-medium">
          <span class="material-symbols-outlined text-lg">explore</span> Explore
        </a>
        <a routerLink="/saved" routerLinkActive="text-primary-container bg-slate-50"
          (click)="mobileOpen.set(false)"
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary-container transition-colors font-medium">
          <span class="material-symbols-outlined text-lg">bookmark</span> Saved Trips
        </a>
        @if (showSearch) {
          <div class="relative mt-2">
            <button type="button" (click)="search()" aria-label="Search" class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-container transition-colors z-10">search</button>
            <input
              [ngModel]="query"
              (ngModelChange)="onSearchInput($event)"
              (keyup.enter)="onEnter()"
              class="w-full h-10 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Search a country…"
              type="text"
            />
            @if (showSuggestions() && suggestions().length) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[120]">
                @for (c of suggestions(); track c.code) {
                  <button type="button" (mousedown)="pickSuggestion(c)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors">
                    <span class="text-lg leading-none">{{ c.flag }}</span>
                    <span class="flex-1 text-sm text-primary truncate">{{ c.name }}</span>
                    <span class="text-[10px] text-slate-400 font-semibold tracking-wider">{{ c.code }}</span>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `
})
export class TopNavComponent {
  @Input() showSearch = true;
  query = '';
  mobileOpen = signal(false);
  suggestions = signal<CountrySummary[]>([]);
  showSuggestions = signal(false);

  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private allCountries: CountrySummary[] = [];
  private loaded = false;
  user = this.auth.user;

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  /** Lazily load the country list the first time the user interacts with search. */
  private ensureCountries(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.api.getCountries().subscribe((list) => (this.allCountries = list));
  }

  onSearchInput(value: string): void {
    this.query = value;
    this.ensureCountries();
    const q = value.trim().toLowerCase();
    if (!q) { this.suggestions.set([]); this.showSuggestions.set(false); return; }
    const matches = this.allCountries
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStart - bStart || a.name.localeCompare(b.name);
      })
      .slice(0, 6);
    this.suggestions.set(matches);
    this.showSuggestions.set(matches.length > 0);
  }

  pickSuggestion(c: CountrySummary): void {
    this.query = '';
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.mobileOpen.set(false);
    this.router.navigate(['/country', c.code]);
  }

  /** Enter picks the top suggestion, or falls back to a map search. */
  onEnter(): void {
    const top = this.suggestions()[0];
    if (top) { this.pickSuggestion(top); return; }
    this.search();
    this.mobileOpen.set(false);
  }

  hideSuggestionsSoon(): void {
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  search(): void {
    if (this.query.trim()) {
      this.router.navigate(['/discover'], { queryParams: { q: this.query.trim() } });
    }
  }
}
