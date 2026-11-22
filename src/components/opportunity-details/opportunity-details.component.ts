import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  map,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Opportunity, opportunityStatusLabel } from '../../models/opportunity.model';
import { ApiRequestError, getApiErrorMessage } from '../../services/api-error.util';
import { AuthService } from '../../services/auth.service';
import {
  ModerationService,
  OpportunityReview,
  ReviewDecision,
} from '../../services/moderation.service';
import { OpportunityService } from '../../services/opportunity.service';

@Component({
  selector: 'app-opportunity-details',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './opportunity-details.component.html',
  styleUrl: './opportunity-details.component.scss',
})
export class OpportunityDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OpportunityService);
  private readonly moderation = inject(ModerationService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();

  readonly adminReview = this.route.snapshot.data['adminReview'] === true;
  readonly statusLabel = opportunityStatusLabel;
  readonly opportunity = signal<Opportunity | null>(null);
  readonly hasReviewNotes = computed(
    () => this.opportunity()?.statusHistory.some((entry) => entry.note) ?? false,
  );
  readonly submission = signal<OpportunityReview | null>(null);
  readonly loading = signal(true);
  readonly missing = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly feedback = signal('');
  readonly busy = signal(false);
  readonly decision = signal<ReviewDecision>('APPROVE');
  readonly note = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.reload.pipe(startWith(undefined))])
      .pipe(
        switchMap(([params]) => {
          const id = Number(params.get('id'));
          this.opportunity.set(null);
          this.submission.set(null);
          this.missing.set(!Number.isSafeInteger(id) || id < 1);
          this.error.set('');
          this.feedback.set('');
          this.actionError.set('');
          this.note.reset();
          this.decision.set('APPROVE');
          if (this.missing()) {
            this.loading.set(false);
            return EMPTY;
          }
          this.loading.set(true);
          return this.auth.restoreSession().pipe(
            switchMap(() =>
              this.adminReview
                ? this.moderation.getOpportunityReview(id).pipe(
                    tap((review) => this.submission.set(review)),
                    map((review) => review.opportunity),
                  )
                : this.service.getById(id),
            ),
            catchError((error: unknown) => {
              if (error instanceof ApiRequestError && error.status === 404) this.missing.set(true);
              else this.error.set(getApiErrorMessage(error));
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((item) => this.opportunity.set(item));
  }

  retry(): void {
    this.reload.next();
  }

  saveDecision(item: Opportunity): void {
    const decision = this.decision();
    this.submit(item, decision !== 'APPROVE', (note) =>
      this.moderation.reviewOpportunity(item.opportunityId, decision, note),
    );
  }

  sendReply(item: Opportunity): void {
    this.submit(item, true, (message) => this.service.respondToReview(item.opportunityId, message));
  }

  private submit(
    item: Opportunity,
    requiresNote: boolean,
    request: (note: string) => ReturnType<OpportunityService['respondToReview']>,
  ): void {
    if (this.busy()) return;
    const note = this.note.value.trim();
    if (this.note.invalid || (requiresNote && !note)) {
      this.actionError.set('Enter a message of up to 1,000 characters.');
      return;
    }
    this.busy.set(true);
    this.actionError.set('');
    this.feedback.set('');
    request(note)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (updated) => {
          if (this.opportunity()?.opportunityId !== item.opportunityId) return;
          this.opportunity.set(updated);
          this.note.reset();
          this.feedback.set(
            this.adminReview ? 'Review recorded.' : 'Your details were sent for another review.',
          );
        },
        error: (error: unknown) => {
          if (this.opportunity()?.opportunityId !== item.opportunityId) return;
          this.actionError.set(getApiErrorMessage(error));
        },
      });
  }
}
