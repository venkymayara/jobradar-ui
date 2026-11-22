import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiBaseUrl)) return next(request);
  const auth = inject(AuthService);
  const isAuthRequest = /\/auth\/(csrf|login|register|refresh|logout)(\?|$)/.test(request.url);
  const isPublicExternalJobsRequest =
    request.method.toUpperCase() === 'GET' && /\/external-jobs(?:\/|\?|$)/.test(request.url);
  const isUnsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase());

  const authenticatedRequest = (token: string | null) => {
    const xsrfToken = isUnsafeMethod ? readCookie('XSRF-TOKEN') : null;
    return request.clone({
      withCredentials: true,
      setHeaders: {
        ...(token && !isAuthRequest && !isPublicExternalJobsRequest
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      },
    });
  };

  return next(authenticatedRequest(auth.accessToken())).pipe(
    catchError((error) => {
      if (isAuthRequest || isPublicExternalJobsRequest || error.status !== 401)
        return throwError(() => error);
      return auth.refreshAccessToken().pipe(
        catchError((refreshError) => {
          if (refreshError.status === 401 || refreshError.status === 403) auth.clearSession();
          return throwError(() => refreshError);
        }),
        switchMap((refreshed) => next(authenticatedRequest(refreshed))),
      );
    }),
  );
};

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}
