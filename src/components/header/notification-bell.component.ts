import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { IconComponent } from '../icon.component';
import { catchError, distinctUntilChanged, map, merge, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  imports: [RouterLink, MatButtonModule, MatBadgeModule, IconComponent],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent {
  private readonly service = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly count = signal(0);

  constructor() {
    toObservable(this.auth.currentUser)
      .pipe(
        map((user) => user?.userId),
        distinctUntilChanged(),
        switchMap((userId) => {
          this.count.set(0);
          if (userId === undefined) return of(0);
          return merge(timer(0, 60000), this.service.changes$).pipe(
            switchMap(() => this.service.unreadCount().pipe(catchError(() => of(this.count())))),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((count) => this.count.set(count));
  }
}
