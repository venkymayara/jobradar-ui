import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';
import { IconComponent, IconName } from '../icon.component';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, MatListModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
})
export class DashboardSidebarComponent {
  readonly auth = inject(AuthService);
  readonly links: ReadonlyArray<{ path: string; label: string; icon: IconName }> = [
    { path: '', label: 'Overview', icon: 'overview' },
    { path: 'my-posts', label: 'My opportunities', icon: 'posts' },
    { path: 'profile', label: 'My profile', icon: 'profile' },
    { path: 'notifications', label: 'Notifications', icon: 'bell' },
    { path: 'reports', label: 'My reports', icon: 'flag' },
    { path: 'settings', label: 'Preferences', icon: 'settings' },
  ];
}
