import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { NotificationBellComponent } from './notification-bell.component';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink, NotificationBellComponent, MatButtonModule, MatMenuModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = signal('');
  readonly signingOut = signal(false);

  logout(): void {
    if (this.signingOut()) return;
    this.signingOut.set(true);
    this.error.set('');
    this.auth
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.signingOut.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: (err) => this.error.set(getApiErrorMessage(err)),
      });
  }
}
