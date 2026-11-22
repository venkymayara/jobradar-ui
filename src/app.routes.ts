import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { authGuard } from './services/auth.guard';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomePageComponent, title: 'JobRadar | Discover opportunities' },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./components/jobs-page/jobs-page.component').then(
            (module) => module.JobsPageComponent,
          ),
        title: 'Find jobs | JobRadar',
      },
      {
        path: 'walk-in-drives',
        loadComponent: () =>
          import('./components/walk-in-page/walk-in-page.component').then(
            (module) => module.WalkInPageComponent,
          ),
        title: 'Walk-in drives | JobRadar',
      },
      { path: 'walk-in-drives/:id', redirectTo: 'opportunities/:id', pathMatch: 'full' },
      {
        path: 'opportunities/:id',
        loadComponent: () =>
          import('./components/opportunity-details/opportunity-details.component').then(
            (module) => module.OpportunityDetailsComponent,
          ),
        title: 'Opportunity | JobRadar',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./components/login-page/login-page.component').then(
            (module) => module.LoginPageComponent,
          ),
        title: 'Log in | JobRadar',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/register-page/register-page.component').then(
            (module) => module.RegisterPageComponent,
          ),
        title: 'Register | JobRadar',
      },
      {
        path: 'submit-walk-in-drive',
        loadComponent: () =>
          import('./components/submit-walk-in-page/submit-walk-in-page.component').then(
            (module) => module.SubmitWalkInPageComponent,
          ),
        canActivate: [authGuard],
        title: 'Submit Walk-in Drive | JobRadar',
      },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard-layout/dashboard-layout.component').then(
        (module) => module.DashboardLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard-home/dashboard-home.component').then(
            (module) => module.DashboardHomeComponent,
          ),
        title: 'Dashboard | JobRadar',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./components/notifications-page/notifications-page.component').then(
            (module) => module.NotificationsPageComponent,
          ),
        title: 'Notifications | JobRadar',
      },
      {
        path: 'my-posts',
        loadComponent: () =>
          import('./components/my-opportunities-page/my-opportunities-page.component').then(
            (module) => module.MyOpportunitiesPageComponent,
          ),
        title: 'My opportunities | JobRadar',
      },
      { path: 'submissions', redirectTo: 'my-posts', pathMatch: 'full' },
      { path: 'saved', redirectTo: '/dashboard/my-posts?view=saved', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile-page/profile-page.component').then(
            (module) => module.ProfilePageComponent,
          ),
        title: 'My profile | JobRadar',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/preferences-page/preferences-page.component').then(
            (module) => module.PreferencesPageComponent,
          ),
        title: 'Preferences | JobRadar',
      },
      { path: 'preferences', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'admin', redirectTo: 'admin/review', pathMatch: 'full' },
      {
        path: 'admin/review',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/admin-review-queue/admin-review-queue.component').then(
            (module) => module.AdminReviewQueueComponent,
          ),
        title: 'Opportunity review | JobRadar',
      },
      {
        path: 'admin/review/:id',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/opportunity-details/opportunity-details.component').then(
            (module) => module.OpportunityDetailsComponent,
          ),
        data: { adminReview: true },
        title: 'Review submission | JobRadar',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./components/reports-page/reports-page.component').then(
            (module) => module.ReportsPageComponent,
          ),
        title: 'My reports | JobRadar',
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/admin-users-page/admin-users-page.component').then(
            (module) => module.AdminUsersPageComponent,
          ),
        title: 'User administration | JobRadar',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
