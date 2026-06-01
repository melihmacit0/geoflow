import { HttpInterceptorFn } from '@angular/common/http';

/** Attaches the stored JWT to outgoing GeoFlow API requests. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('geoflow_token');
  if (token && req.url.includes('/api/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
