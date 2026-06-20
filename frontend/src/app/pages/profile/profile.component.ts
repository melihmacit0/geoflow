import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';

@Component({
  selector: 'gf-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TopNavComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  savedMsg = signal('');

  // Editable form model seeded from the current user.
  form: Partial<User> = { ...(this.user() ?? {}) };

  airports = ['Istanbul — IST', 'London — LHR', 'New York — JFK', 'Tokyo — HND'];
  currencies = ['USD ($)', 'EUR (€)', 'TRY (₺)', 'JPY (¥)'];
  languages = ['English', 'Turkish', 'French', 'Japanese'];

  reduceMotion = signal(false);
  highContrast = signal(true);

  save(): void {
    this.auth.updateProfile(this.form).subscribe(() => {
      this.savedMsg.set('Saved ✓');
      setTimeout(() => this.savedMsg.set(''), 2000);
    });
  }

  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  /** Smooth-scroll to an in-page section (offset for the fixed 64px top nav). */
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
