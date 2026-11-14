import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, EMPTY, catchError, finalize, map, shareReplay, tap } from 'rxjs';
import { AuthCredentials, AuthSession, RegisterRequest, User } from '../models/user.model';
import { ApiService } from './api.service';
import { ApiRequestError, getApiErrorMessage } from './api-error.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly sessionState = signal<AuthSession | null>(null);
  readonly session = this.sessionState.asReadonly();
  readonly currentUser = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly sessionError = signal('');
  private refreshRequest?: Observable<string>;

  accessToken(): string | null { return this.sessionState()?.accessToken ?? null; }
  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.api.post<AuthSession, AuthCredentials>('/auth/login', credentials, undefined, true).pipe(tap(session => this.sessionState.set(session)));
  }
  register(request: RegisterRequest): Observable<User> { return this.api.post<User, RegisterRequest>('/auth/register', request); }
  refreshAccessToken(): Observable<string> {
    this.refreshRequest ??= this.api.post<AuthSession, Record<string, never>>('/auth/refresh', {}, undefined, true).pipe(
      tap(session => this.sessionState.set(session)), map(session => session.accessToken),
      finalize(() => { this.refreshRequest = undefined; }), shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.refreshRequest;
  }
  restoreSession(): Observable<void> {
    return this.refreshAccessToken().pipe(
      tap(() => this.sessionError.set('')),
      map(() => undefined),
      catchError(error => {
        if (!(error instanceof ApiRequestError) || (error.status !== 401 && error.status !== 403)) this.sessionError.set(getApiErrorMessage(error));
        return EMPTY;
      })
    );
  }
  logout(): Observable<void> {
    return this.api.post<void, Record<string, never>>('/auth/logout', {}, undefined, true).pipe(finalize(() => this.clearSession()));
  }
  clearSession(): void { this.sessionState.set(null); }
}
