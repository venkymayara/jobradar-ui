import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpportunityCardComponent } from '../opportunity-card/opportunity-card.component';
import { DashboardSummary } from '../../models/user.model';
import { Opportunity } from '../../models/opportunity.model';
import { UserService } from '../../services/user.service';
import { OpportunityService } from '../../services/opportunity.service';
import { getApiErrorMessage } from '../../services/api-error.util';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [OpportunityCardComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly opportunityService = inject(OpportunityService);
  private readonly destroyRef = inject(DestroyRef);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly recommendations = signal<Opportunity[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly recommendationsError = signal('');

  ngOnInit(): void {
    this.userService.getDashboard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: summary => { this.summary.set(summary); this.loading.set(false); },
      error: err => { this.error.set(getApiErrorMessage(err)); this.loading.set(false); }
    });
    this.opportunityService.getOpportunities({ page: 0, size: 3, sort: 'publishedAt,desc' })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: page => this.recommendations.set(page.content),
        error: err => this.recommendationsError.set(getApiErrorMessage(err))
      });
  }
}
