import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModerationReport } from '../../models/moderation.model';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent implements OnInit {
  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  readonly reports = signal<ModerationReport[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  ngOnInit(): void {
    this.users
      .getMyReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.reports.set(page.content);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Reports could not be loaded.');
          this.loading.set(false);
        },
      });
  }
}
