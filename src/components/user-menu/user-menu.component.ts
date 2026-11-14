import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { getApiErrorMessage } from '../../services/api-error.util';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  readonly user = signal<User | null>(null);
  readonly error = signal('');
  private readonly session$ = toObservable(this.auth.session);

  ngOnInit(): void {
    this.session$.pipe(
      distinctUntilChanged((previous, current) => previous?.accessToken === current?.accessToken),
      switchMap(session => {
        if (!session) { this.user.set(null); return of(null); }
        return this.userService.getMe().pipe(catchError(err => { this.error.set(getApiErrorMessage(err)); return of(null); }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(user => this.user.set(user));
  }

  logout(): void {
    this.auth.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: err => this.error.set(getApiErrorMessage(err))
    });
  }
}
