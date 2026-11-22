import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { Opportunity, opportunityStatusLabel } from '../../models/opportunity.model';
import { PageResponse } from '../../models/pagination.model';
import { getApiErrorMessage } from '../../services/api-error.util';
import { ModerationService, ReviewQueueStatus } from '../../services/moderation.service';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-admin-review-queue',
  imports: [RouterLink, PaginationComponent, MatButtonModule],
  templateUrl: './admin-review-queue.component.html',
  styleUrl: './admin-review-queue.component.scss',
})
export class AdminReviewQueueComponent implements OnInit {
  private readonly moderation = inject(ModerationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly request = new Subject<number>();
  readonly queue = signal<ReviewQueueStatus>('PENDING');
  readonly page = signal<PageResponse<Opportunity> | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly statusLabel = opportunityStatusLabel;

  ngOnInit(): void {
    this.request
      .pipe(
        switchMap((page) => {
          this.loading.set(true);
          this.error.set('');
          return this.moderation.getOpportunityQueue(this.queue(), page).pipe(
            catchError((error: unknown) => {
              this.error.set(getApiErrorMessage(error));
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.page.set(result));
    this.load();
  }

  selectQueue(status: ReviewQueueStatus): void {
    this.queue.set(status);
    this.load();
  }

  load(page = 0): void {
    this.request.next(page);
  }
}
import { MatButtonModule } from '@angular/material/button';
