import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.auth.sessionExpired()) return;
      const returnUrl = this.router.url;
      if (/^\/(?:dashboard|submit-walk-in-drive)(?:[/?#]|$)/.test(returnUrl)) {
        void this.router.navigate(['/login'], { queryParams: { returnUrl } });
      }
    });
  }

  ngOnInit(): void {
    this.auth.restoreSession().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
