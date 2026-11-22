import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Notification, NotificationPage } from '../../models/notification.model';
import { getApiErrorMessage } from '../../services/api-error.util';
import { NotificationService } from '../../services/notification.service';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-notifications-page',
  imports: [DatePipe, PaginationComponent, MatButtonModule],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private pageIndex = 0;
  readonly page = signal<NotificationPage | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .list(this.pageIndex)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (page) => this.page.set(page),
        error: (error) => this.error.set(getApiErrorMessage(error)),
      });
  }

  changePage(page: number): void {
    if (this.busy()) return;
    this.pageIndex = page - 1;
    this.load();
  }

  open(item: Notification): void {
    if (this.busy() || item.referenceId === null) return;
    const base =
      item.referenceType === 'ADMIN_REVIEW' ? '/dashboard/admin/review' : '/opportunities';
    const navigate = () => void this.router.navigate([base, item.referenceId]);
    if (item.read) {
      navigate();
      return;
    }
    this.markRead(item, navigate);
  }

  markRead(item: Notification, onSuccess?: () => void): void {
    this.perform(this.service.markRead(item.id), (updated) => {
      this.page.update((page) =>
        page
          ? { ...page, content: page.content.map((row) => (row.id === updated.id ? updated : row)) }
          : null,
      );
      onSuccess?.();
    });
  }

  markAll(): void {
    this.perform(this.service.markAllRead(), () => this.load());
  }

  remove(id: number): void {
    this.perform(this.service.remove(id), () => {
      if (this.page()?.content.length === 1 && this.pageIndex > 0) this.pageIndex -= 1;
      this.load();
    });
  }

  private perform<T>(request: Observable<T>, onSuccess: (value: T) => void): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.actionError.set('');
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: onSuccess,
        error: (error) => this.actionError.set(getApiErrorMessage(error)),
      });
  }
}
import { MatButtonModule } from '@angular/material/button';
