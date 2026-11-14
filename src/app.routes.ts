import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { JobsPageComponent } from './components/jobs-page/jobs-page.component';
import { WalkInPageComponent } from './components/walk-in-page/walk-in-page.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomePageComponent, title: 'JobRadar | Discover opportunities' },
      { path: 'jobs', component: JobsPageComponent, title: 'Find jobs | JobRadar' },
      { path: 'walk-in-drives', component: WalkInPageComponent, title: 'Walk-in drives | JobRadar' }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: DashboardHomeComponent, title: 'Dashboard | JobRadar' }
    ]
  },
  { path: '**', redirectTo: '' }
];
