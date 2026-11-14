import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { getApiErrorMessage } from '../../services/api-error.util';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss'
})
export class DashboardSidebarComponent implements OnInit {
  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  readonly user = signal<User | null>(null);
  readonly error = signal('');
  ngOnInit(): void {
    this.users.getMe().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => this.user.set(user),
      error: err => this.error.set(getApiErrorMessage(err))
    });
  }
}
