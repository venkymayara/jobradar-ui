import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, finalize, map } from 'rxjs';
import { opportunityStatusLabel } from '../../models/opportunity.model';
import { getApiErrorMessage } from '../../services/api-error.util';
import { SavedOpportunityService } from '../../services/saved-opportunity.service';
import { UserService } from '../../services/user.service';
import { OpportunityCardComponent } from '../opportunity-card/opportunity-card.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-my-opportunities-page',
  imports: [OpportunityCardComponent, PaginationComponent, RouterLink, MatButtonModule],
  templateUrl: './my-opportunities-page.component.html',
  styleUrl: './my-opportunities-page.component.scss',
})
export class MyOpportunitiesPageComponent {
  private readonly users = inject(UserService);
  private readonly saved = inject(SavedOpportunityService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly query = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const page = Number(params.get('page'));
        return {
          saved: params.get('view') === 'saved',
          page: Number.isSafeInteger(page) && page > 0 ? page - 1 : 0,
        };
      }),
      distinctUntilChanged((a, b) => a.saved === b.saved && a.page === b.page),
    ),
    { requireSync: true },
  );

  readonly pageSize = 10;
  readonly isSavedView = computed(() => this.query().saved);
  readonly results = rxResource({
    params: this.query,
    stream: ({ params }) =>
      params.saved
        ? this.saved.getSaved({ page: params.page, size: this.pageSize })
        : this.users.getMyOpportunities(params.page, this.pageSize),
  });

  readonly statusLabel = opportunityStatusLabel;
  readonly removing = signal<number | null>(null);
  readonly removalError = signal('');

  changePage(page: number): void {
    this.removalError.set('');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  removeSaved(id: number): void {
    if (this.removing() !== null || !this.isSavedView()) return;
    this.removing.set(id);
    this.removalError.set('');
    const current = this.query();
    this.saved
      .remove(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.removing.set(null)),
      )
      .subscribe({
        next: () => {
          if (this.query() !== current) return;
          if (current.page > 0 && this.results.value()?.content.length === 1) {
            this.changePage(current.page);
          } else {
            this.results.reload();
          }
        },
        error: (error) => {
          if (this.query() === current) this.removalError.set(getApiErrorMessage(error));
        },
      });
  }
}
