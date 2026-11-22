import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HeroSearchComponent } from '../hero-search/hero-search.component';
import { RoleCategoriesComponent } from '../role-categories/role-categories.component';
import { LatestOpportunitiesComponent } from '../latest-opportunities/latest-opportunities.component';
import { WalkInPreviewComponent } from '../walk-in-preview/walk-in-preview.component';
import { PopularSkillsComponent } from '../popular-skills/popular-skills.component';
import { CommunityCtaComponent } from '../community-cta/community-cta.component';
import { HomeData, HomeService } from '../../services/home.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { ExternalJobService } from '../../services/external-job.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroSearchComponent,
    RoleCategoriesComponent,
    LatestOpportunitiesComponent,
    WalkInPreviewComponent,
    PopularSkillsComponent,
    CommunityCtaComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {
  private readonly homeService = inject(HomeService);
  private readonly destroyRef = inject(DestroyRef);
  readonly home = signal<HomeData | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  private readonly indiaCounts = toSignal(
    inject(ExternalJobService)
      .getIndiaJobCategoryCounts()
      .pipe(catchError(() => of({} as Record<number, number>))),
  );
  readonly roleCategoriesLoading = computed(
    () => !this.error() && (this.loading() || !this.indiaCounts()),
  );
  readonly roleCategories = computed(() => {
    const counts = this.indiaCounts();
    return (this.home()?.categories ?? [])
      .map((category) => ({
        ...category,
        opportunityCount: category.opportunityCount + (counts?.[category.categoryId] ?? 0),
      }))
      .filter((category) => category.opportunityCount > 0)
      .sort((left, right) => right.opportunityCount - left.opportunityCount);
  });

  ngOnInit(): void {
    this.homeService
      .getHomeData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.home.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(getApiErrorMessage(err));
          this.loading.set(false);
        },
      });
  }
}
