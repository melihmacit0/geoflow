import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'gf-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.component.html'
})
export class SigninComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<'signin' | 'signup'>('signin');
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  name = '';
  email = 'explorer@geoflow.com';
  password = 'explorer';

  setMode(m: 'signin' | 'signup'): void {
    this.mode.set(m);
    this.error.set('');
    if (m === 'signup') {
      this.email = '';
      this.password = '';
    }
  }

  submit(): void {
    this.error.set('');
    if (!this.email || !this.password || (this.mode() === 'signup' && !this.name)) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    const request$ =
      this.mode() === 'signin'
        ? this.auth.login(this.email, this.password)
        : this.auth.register(this.name, this.email, this.password);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/discover');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Something went wrong. Please try again.');
      }
    });
  }
}
