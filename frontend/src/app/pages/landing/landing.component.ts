import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FooterComponent } from '../../shared/footer.component';

@Component({
  selector: 'gf-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  private auth = inject(AuthService);
  user = this.auth.user;
}
