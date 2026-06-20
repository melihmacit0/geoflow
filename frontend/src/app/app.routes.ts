import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'signin',
    loadComponent: () => import('./pages/signin/signin.component').then((m) => m.SigninComponent)
  },
  {
    path: 'discover',
    loadComponent: () => import('./pages/discover/discover.component').then((m) => m.DiscoverComponent)
  },
  {
    path: 'country/:code',
    loadComponent: () =>
      import('./pages/country-detail/country-detail.component').then((m) => m.CountryDetailComponent)
  },
  {
    path: 'country/:code/city/:iata',
    loadComponent: () =>
      import('./pages/city-detail/city-detail.component').then((m) => m.CityDetailComponent)
  },
  {
    path: 'saved',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/saved/saved.component').then((m) => m.SavedComponent)
  },
  // Compare lives inside the Saved page (select 2–3 saved trips). Keep the old
  // /compare path working by redirecting there.
  { path: 'compare', redirectTo: 'saved', pathMatch: 'full' },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent)
  },
  { path: '**', redirectTo: '' }
];
