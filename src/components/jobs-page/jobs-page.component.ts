import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { EmploymentType, Opportunity, OpportunityQuery, OpportunityType, WorkMode } from '../../models/opportunity.model';
import { PageResponse } from '../../models/pagination.model';
import { OpportunityService } from '../../services/opportunity.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { JobSearchComponent } from '../job-search/job-search.component';
import { JobFilterSidebarComponent, JobFilters } from '../job-filter-sidebar/job-filter-sidebar.component';
import { JobResultsComponent } from '../job-results/job-results.component';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [JobSearchComponent, JobFilterSidebarComponent, JobResultsComponent],
  templateUrl: './jobs-page.component.html',
  styleUrl: './jobs-page.component.scss'
})
export class JobsPageComponent implements OnInit {
  keyword = ''; location = ''; page = 0; size = 10;
  opportunities: Opportunity[] = [];
  totalPages = 0; totalElements = 0; loading = true; error = '';
  filters: JobFilters = { workMode: '', experience: '', employmentType: '', opportunityType: '' };
  private readonly data = inject(OpportunityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => ({
        keyword: params.get('keyword') ?? '', role: params.get('role') ?? '', skills: params.getAll('skills'),
        company: params.get('company') ?? '', location: params.get('location') ?? '',
        minExperience: this.numberParam(params.get('minExperience')), maxExperience: this.numberParam(params.get('maxExperience')),
        workMode: (params.get('workMode') || undefined) as WorkMode | undefined,
        employmentType: (params.get('employmentType') || undefined) as EmploymentType | undefined,
        opportunityType: (params.get('opportunityType') || undefined) as OpportunityType | undefined,
        minSalary: this.numberParam(params.get('minSalary')), maxSalary: this.numberParam(params.get('maxSalary')),
        postedWithin: params.get('postedWithin') || undefined,
        page: this.numberParam(params.get('page')) ?? 0, size: this.numberParam(params.get('size')) ?? this.size,
        sort: params.getAll('sort')
      } satisfies OpportunityQuery)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(query => {
        this.loading = true; this.error = ''; this.keyword = query.keyword ?? ''; this.location = query.location ?? ''; this.page = query.page ?? 0; this.size = query.size ?? 10;
        this.filters = { workMode: query.workMode ?? '', employmentType: query.employmentType ?? '', opportunityType: query.opportunityType ?? '',
          experience: query.minExperience === undefined ? '' : `${query.minExperience}-${query.maxExperience ?? ''}` };
      }),
      switchMap(query => this.data.getOpportunities(query).pipe(
        map(data => ({ data, error: '' })),
        catchError(error => of({ data: null, error: getApiErrorMessage(error) }))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.loading = false;
      if (result.data) { this.opportunities = result.data.content; this.totalPages = result.data.totalPages; this.totalElements = result.data.totalElements; }
      else { this.opportunities = []; this.totalPages = 0; this.totalElements = 0; this.error = result.error; }
    });
  }
  onSearch(value: { keyword: string; location: string }): void {
    this.updateQuery({ keyword: value.keyword || null, location: value.location || null, page: 0 });
  }
  onFilters(filters: JobFilters): void {
    this.filters = filters;
    const [minExperience, maxExperience] = filters.experience.split('-').map(value => Number(value));
    this.updateQuery({ workMode: filters.workMode || null, employmentType: filters.employmentType || null, opportunityType: filters.opportunityType || null,
      minExperience: filters.experience ? minExperience : null, maxExperience: filters.experience ? (Number.isFinite(maxExperience) ? maxExperience : null) : null, page: 0 });
  }
  onPageChange(page: number): void { this.updateQuery({ page: page - 1 }); }
  onSortChange(sort: string): void { this.updateQuery({ sort, page: 0 }); }
  private updateQuery(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
  private numberParam(value: string | null): number | undefined { if (value === null || value === '') return undefined; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
}
