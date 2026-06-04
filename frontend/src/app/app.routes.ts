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
    loadComponent: () =>
      import('./pages/discover/discover.component').then((m) => m.DiscoverComponent)
  },
  {
    path: 'country/:code',
    loadComponent: () =>
      import('./pages/country-detail/country-detail.component').then(
        (m) => m.CountryDetailComponent
      )
  },
  {
    path: 'country/:code/hotels',
    loadComponent: () =>
      import('./pages/hotels/hotels.component').then((m) => m.HotelsComponent)
  },
  {
    path: 'country/:code/cars',
    loadComponent: () =>
      import('./pages/cars/cars.component').then((m) => m.CarsComponent)
  },
  {
    path: 'saved',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/saved/saved.component').then((m) => m.SavedComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./pages/compare/compare.component').then((m) => m.CompareComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent)
  },
  { path: '**', redirectTo: '' }
];
