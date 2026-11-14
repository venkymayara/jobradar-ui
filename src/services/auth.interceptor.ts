import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiBaseUrl)) return next(request);
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const isAuthRequest = /\/auth\/(login|register|refresh|logout)(\?|$)/.test(request.url);
  const withAuth = request.clone({
    withCredentials: true,
    ...(token && !isAuthRequest ? { setHeaders: { Authorization: `Bearer ${token}` } } : {})
  });

  return next(withAuth).pipe(catchError(error => {
    if (isAuthRequest || error.status !== 401) return throwError(() => error);
    return auth.refreshAccessToken().pipe(
      switchMap(refreshed => next(withAuth.clone({ setHeaders: { Authorization: `Bearer ${refreshed}` } }))),
      catchError(refreshError => { auth.clearSession(); return throwError(() => refreshError); })
    );
  }));
};
