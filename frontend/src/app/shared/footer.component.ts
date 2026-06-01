import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'gf-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="w-full py-16 bg-slate-50 border-t border-slate-200">
      <div
        class="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div class="flex flex-col items-center md:items-start gap-2">
          <a routerLink="/" class="text-xl font-bold text-primary-container">GeoFlow</a>
          <p class="text-slate-500 text-sm text-center md:text-left">
            © 2026 GeoFlow. Discover. Learn. Travel.
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-8 text-sm">
          <a class="text-slate-500 hover:text-primary-container hover:underline underline-offset-4 transition-all" href="#">Privacy Policy</a>
          <a class="text-slate-500 hover:text-primary-container hover:underline underline-offset-4 transition-all" href="#">Terms of Service</a>
          <a class="text-slate-500 hover:text-primary-container hover:underline underline-offset-4 transition-all" href="#">About</a>
          <a class="text-slate-500 hover:text-primary-container hover:underline underline-offset-4 transition-all" href="#">Contact</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
