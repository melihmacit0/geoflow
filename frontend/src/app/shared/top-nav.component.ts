import { Component, Input, inject } from '@angular/core';
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
      class="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-8 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5E5E0] shadow-[0_20px_20px_rgba(15,44,92,0.04)] text-sm font-medium tracking-tight"
    >
      <div class="flex items-center gap-10">
        <a routerLink="/" class="text-2xl font-bold tracking-tighter text-primary-container">GeoFlow</a>
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

      <nav class="flex items-center gap-8">
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
          <a
            routerLink="/compare"
            routerLinkActive="text-primary-container border-b-2 border-primary-container"
            class="text-slate-500 hover:text-primary-container transition-colors pb-1"
            >Compare</a
          >
        </div>
        <div class="flex items-center gap-3 pl-6 border-l border-slate-100">
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
              class="bg-primary-container text-white px-5 py-2 rounded-lg hover:bg-primary transition-all active:scale-95 font-medium"
              >Sign In</a
            >
          }
        </div>
      </nav>
    </header>
  `
})
export class TopNavComponent {
  @Input() showSearch = true;
  query = '';

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
