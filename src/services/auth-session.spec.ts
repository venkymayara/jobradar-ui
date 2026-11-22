import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { EMPTY, firstValueFrom, of } from 'rxjs';
import { CommunityCtaComponent } from '../components/community-cta/community-cta.component';
import { MainNavigationComponent } from '../components/header/main-navigation.component';
import { UserMenuComponent } from '../components/header/user-menu.component';
import { environment } from '../environments/environment';
import { AuthSession } from '../models/user.model';
import { apiErrorInterceptor } from './api-error.interceptor';
import { authGuard } from './auth.guard';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { UserService } from './user.service';

@Component({ selector: 'test-profile-page', template: 'Profile', standalone: true })
class ProfilePage {}

@Component({ selector: 'test-login-page', template: 'Login', standalone: true })
class LoginPage {}

const session: AuthSession = {
  accessToken: 'test-access-token',
  expiresIn: 900,
  tokenType: 'Bearer',
  user: { userId: 1, displayName: 'Test User', email: 'user@example.test', roles: ['ROLE_USER'] },
};

describe('Profile session', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: ProfilePage, canActivate: [authGuard] },
          { path: 'dashboard/profile', component: ProfilePage, canActivate: [authGuard] },
          { path: 'submit-walk-in-drive', component: ProfilePage, canActivate: [authGuard] },
          { path: 'login', component: LoginPage },
        ]),
        provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: { unreadCount: () => of(0), changes$: EMPTY } },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  function csrf(): void {
    http.expectOne(environment.apiBaseUrl + '/auth/csrf').flush({ data: { token: 'test' } });
  }

  function refresh() {
    const request = http.expectOne(environment.apiBaseUrl + '/auth/refresh');
    expect(request.request.withCredentials).toBe(true);
    return request;
  }

  it('keeps guest actions hidden until session restore has finished', async () => {
    const fixture = TestBed.createComponent(UserMenuComponent);
    const restored = firstValueFrom(auth.restoreSession());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Get started');
    csrf();
    refresh().flush({}, { status: 401, statusText: 'Unauthorized' });
    await restored;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Get started');
  });

  it('clears a restored session at the server-provided deadline', async () => {
    vi.useFakeTimers();
    try {
      const restored = firstValueFrom(auth.restoreSession());
      csrf();
      refresh().flush({ data: { ...session, sessionExpiresIn: 1 } });
      await restored;
      vi.advanceTimersByTime(999);
      expect(auth.currentUser()).toEqual(session.user);
      vi.advanceTimersByTime(1);
      expect(auth.currentUser()).toBeNull();
      expect(auth.sessionExpired()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses the current CSRF cookie when retrying a role update after access-token expiry', async () => {
    const restored = firstValueFrom(auth.restoreSession());
    csrf();
    refresh().flush({ data: session });
    await restored;

    const path = '/admin/users/2/admin-permission';
    document.cookie = 'XSRF-TOKEN=old-csrf; path=/';
    try {
      const update = firstValueFrom(TestBed.inject(ApiService).put(path, { enabled: true }));
      const first = http.expectOne(environment.apiBaseUrl + path);
      expect(first.request.headers.get('X-XSRF-TOKEN')).toBe('old-csrf');
      first.flush({}, { status: 401, statusText: 'Unauthorized' });

      const tokenRequest = http.expectOne(environment.apiBaseUrl + '/auth/csrf');
      expect(tokenRequest.request.headers.has('Authorization')).toBe(false);
      document.cookie = 'XSRF-TOKEN=new-csrf; path=/';
      tokenRequest.flush({ data: { token: 'new-csrf' } });
      refresh().flush({ data: { ...session, accessToken: 'new-access-token' } });

      const retried = http.expectOne(environment.apiBaseUrl + path);
      expect(retried.request.headers.get('Authorization')).toBe('Bearer new-access-token');
      expect(retried.request.headers.get('X-XSRF-TOKEN')).toBe('new-csrf');
      retried.flush({ data: null });
      await update;
    } finally {
      document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
    }
  });

  it('shares session restore with the guard and keeps a direct profile URL', async () => {
    const harness = await RouterTestingHarness.create();
    const guardStarted = vi.spyOn(auth, 'restoreSession');
    const restored = firstValueFrom(auth.restoreSession());
    const profile = harness.navigateByUrl('/dashboard/profile', ProfilePage);

    await vi.waitFor(() => expect(guardStarted).toHaveBeenCalledTimes(2));
    csrf();
    refresh().flush({ data: session });

    await restored;
    await profile;
    expect(router.url).toBe('/dashboard/profile');
    expect(auth.currentUser()).toEqual(session.user);
  });

  it('redirects an anonymous profile visit to login with its return URL', async () => {
    const harness = await RouterTestingHarness.create();
    const guardStarted = vi.spyOn(auth, 'restoreSession');
    const navigation = harness.navigateByUrl('/dashboard/profile', LoginPage);

    await vi.waitFor(() => expect(guardStarted).toHaveBeenCalledOnce());
    csrf();
    refresh().flush({}, { status: 401, statusText: 'Unauthorized' });

    await navigation;
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/dashboard/profile');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('waits for the initial refresh to finish before issuing login', async () => {
    const login = firstValueFrom(
      auth.login({ email: session.user.email, password: 'test-password' }),
    );
    http.expectNone(environment.apiBaseUrl + '/auth/login');
    csrf();
    refresh().flush({}, { status: 401, statusText: 'Unauthorized' });

    csrf();
    http.expectOne(environment.apiBaseUrl + '/auth/login').flush({ data: session });
    await login;
    expect(auth.isAuthenticated()).toBe(true);
  });

  it.each([
    { label: 'Dashboard', component: MainNavigationComponent, path: '/dashboard' },
    {
      label: 'Share an opportunity',
      component: CommunityCtaComponent,
      path: '/submit-walk-in-drive',
    },
  ])('routes $label through login for a guest', async ({ component, path }) => {
    const navigation = TestBed.createComponent(component);
    navigation.detectChanges();
    const link: HTMLAnchorElement = navigation.nativeElement.querySelector(`a[href="${path}"]`);
    expect(link).toBeTruthy();

    const restore = vi.spyOn(auth, 'restoreSession');
    link.click();
    await vi.waitFor(() => expect(restore).toHaveBeenCalledOnce());
    csrf();
    refresh().flush({}, { status: 401, statusText: 'Unauthorized' });

    await vi.waitFor(() => expect(router.url).toContain('/login'));
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe(path);
  });

  it('opens the submission form directly from the community link when signed in', async () => {
    const restored = firstValueFrom(auth.restoreSession());
    csrf();
    refresh().flush({ data: session });
    await restored;

    const community = TestBed.createComponent(CommunityCtaComponent);
    community.detectChanges();
    const link: HTMLAnchorElement = community.nativeElement.querySelector('a');
    link.click();

    await vi.waitFor(() => expect(router.url).toBe('/submit-walk-in-drive'));
  });

  it('opens the profile from the account link and uses a separate logout action', async () => {
    const restored = firstValueFrom(auth.restoreSession());
    csrf();
    refresh().flush({ data: session });
    await restored;

    const fixture = TestBed.createComponent(UserMenuComponent);
    fixture.detectChanges();
    http.expectNone(environment.apiBaseUrl + '/users/me');
    const saved = firstValueFrom(
      TestBed.inject(UserService).updateProfile({ displayName: 'Updated Name' }),
    );
    http.expectOne(environment.apiBaseUrl + '/users/me').flush({
      data: { ...session.user, displayName: 'Updated Name', roles: ['ROLE_ADMIN'] },
    });
    await saved;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Updated Name');
    expect(auth.currentUser()?.roles).toEqual(session.user.roles);

    const account: HTMLAnchorElement = fixture.nativeElement.querySelector('a.account');
    expect(account.getAttribute('href')).toBe('/dashboard/profile');
    account.click();
    await vi.waitFor(() => expect(router.url).toBe('/dashboard/profile'));
    expect(auth.isAuthenticated()).toBe(true);
    http.expectNone(environment.apiBaseUrl + '/auth/logout');

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const options = await loader.getHarness(MatMenuHarness);
    await options.open();
    expect(await options.isOpen()).toBe(true);
    await options.close();
    expect(await options.isOpen()).toBe(false);
    await options.open();
    const logout = document.querySelector<HTMLButtonElement>(
      '[role="menu"] button[role="menuitem"]',
    );
    expect(logout?.textContent).toContain('Sign out');
    logout?.click();
    csrf();
    http.expectOne(environment.apiBaseUrl + '/auth/logout').flush({ data: null });
    await vi.waitFor(() => expect(router.url).toBe('/login'));
    expect(auth.isAuthenticated()).toBe(false);
  });
});
