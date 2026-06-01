import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { SavedDestination } from '../../core/models';
import { TopNavComponent } from '../../shared/top-nav.component';
import { FooterComponent } from '../../shared/footer.component';

@Component({
  selector: 'gf-saved',
  standalone: true,
  imports: [CommonModule, RouterLink, TopNavComponent, FooterComponent],
  templateUrl: './saved.component.html'
})
export class SavedComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  saved = signal<SavedDestination[]>([]);
  loading = signal(true);

  constructor() {
    this.api.getSaved().subscribe((list) => {
      this.saved.set(list);
      this.loading.set(false);
    });
  }

  open(code: string): void {
    this.router.navigate(['/country', code]);
  }

  remove(code: string, event: Event): void {
    event.stopPropagation();
    this.api.removeSaved(code).subscribe(() => {
      this.saved.set(this.saved().filter((s) => s.code !== code));
    });
  }
}
