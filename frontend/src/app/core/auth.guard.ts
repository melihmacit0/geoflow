import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Gates pages that need a signed-in explorer (saved, profile). */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  // Remember where they were headed so sign-in can send them back.
  router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
  return false;
};
