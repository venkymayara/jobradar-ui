import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  Observable,
  catchError,
  defer,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { AuthCredentials, AuthSession, RegisterRequest, User } from '../models/user.model';
import { ApiService } from './api.service';
import { ApiRequestError, getApiErrorMessage } from './api-error.util';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly sessionState = signal<AuthSession | null>(null);
  readonly sessionReady = signal(false);
  readonly sessionExpired = signal(false);
  readonly currentUser = computed(() => this.sessionState()?.user ?? null);
  readonly isSuperAdmin = computed(
    () => this.currentUser()?.roles.includes('ROLE_SUPER_ADMIN') ?? false,
  );
  readonly isAdmin = computed(
    () => this.isSuperAdmin() || (this.currentUser()?.roles.includes('ROLE_ADMIN') ?? false),
  );
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly sessionError = signal('');
  private initialRestore?: Observable<void>;
  private refreshRequest?: Observable<string>;
  private csrfRequest?: Observable<void>;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));
  }

  accessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }
  updateCurrentUser(user: User): void {
    this.sessionState.update((session) =>
      session?.user.userId === user.userId
        ? { ...session, user: { ...user, roles: session.user.roles } }
        : session,
    );
  }
  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.restoreSession().pipe(
      switchMap(() => this.ensureCsrf()),
      switchMap(() =>
        this.api.post<ApiResponse<AuthSession>, AuthCredentials>(
          '/auth/login',
          credentials,
          undefined,
          true,
        ),
      ),
      map((response) => response.data),
      tap((session) => {
        this.setSession(session);
        this.sessionError.set('');
      }),
    );
  }
  register(request: RegisterRequest): Observable<User> {
    return this.api
      .post<ApiResponse<User>, RegisterRequest>('/auth/register', request)
      .pipe(map((response) => response.data));
  }
  refreshAccessToken(): Observable<string> {
    this.refreshRequest ??= this.ensureCsrf().pipe(
      switchMap(() =>
        this.api.post<ApiResponse<AuthSession>, Record<string, never>>(
          '/auth/refresh',
          {},
          undefined,
          true,
        ),
      ),
      map((response) => response.data),
      tap((session) => this.setSession(session)),
      map((session) => session.accessToken),
      finalize(() => {
        this.refreshRequest = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshRequest;
  }
  restoreSession(): Observable<void> {
    this.initialRestore ??= defer(() =>
      this.isAuthenticated() ? of(undefined) : this.refreshAccessToken(),
    ).pipe(
      tap(() => this.sessionError.set('')),
      map(() => undefined),
      catchError((error) => {
        if (!(error instanceof ApiRequestError) || (error.status !== 401 && error.status !== 403))
          this.sessionError.set(getApiErrorMessage(error));
        return of(undefined);
      }),
      tap(() => this.sessionReady.set(true)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.initialRestore;
  }
  logout(): Observable<void> {
    return this.ensureCsrf().pipe(
      switchMap(() =>
        this.api.post<ApiResponse<null>, Record<string, never>>(
          '/auth/logout',
          {},
          undefined,
          true,
        ),
      ),
      map(() => undefined),
      finalize(() => this.clearSession()),
    );
  }
  clearSession(): void {
    clearTimeout(this.expiryTimer);
    this.sessionState.set(null);
  }

  private setSession(session: AuthSession): void {
    clearTimeout(this.expiryTimer);
    this.sessionState.set(session);
    this.sessionExpired.set(false);
    if (session.sessionExpiresIn === undefined || !Number.isFinite(session.sessionExpiresIn))
      return;

    const deadline = Date.now() + session.sessionExpiresIn * 1000;
    const schedule = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        this.clearSession();
        this.sessionExpired.set(true);
      } else {
        this.expiryTimer = setTimeout(schedule, Math.min(remaining, 2_147_483_647));
      }
    };
    schedule();
  }

  ensureCsrf(): Observable<void> {
    this.csrfRequest ??= this.api
      .get<ApiResponse<{ token: string }>>('/auth/csrf', undefined, true)
      .pipe(
        map(() => undefined),
        finalize(() => {
          this.csrfRequest = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.csrfRequest;
  }
}
