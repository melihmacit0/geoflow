import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

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
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              [(ngModel)]="query"
              (keyup.enter)="search()"
              class="w-full h-10 pl-12 pr-4 bg-slate-50 border-none rounded-full focus:ring-1 focus:ring-primary/20 text-sm placeholder:text-slate-400"
              placeholder="Search countries, cities, or interests..."
              type="text"
            />
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
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              [(ngModel)]="query"
              (keyup.enter)="search(); mobileOpen.set(false)"
              class="w-full h-10 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/20"
              placeholder="Search destinations..."
              type="text"
            />
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

  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.user;

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  search(): void {
    if (this.query.trim()) {
      this.router.navigate(['/discover'], { queryParams: { q: this.query.trim() } });
    }
  }
}
