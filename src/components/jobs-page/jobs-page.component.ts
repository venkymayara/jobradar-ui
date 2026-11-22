import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import {
  EmploymentType,
  Opportunity,
  OpportunityQuery,
  OpportunityType,
  WorkMode,
} from '../../models/opportunity.model';
import { OpportunityService } from '../../services/opportunity.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { JobSearchComponent } from '../job-search/job-search.component';
import {
  JobFilterSidebarComponent,
  JobFilters,
} from '../job-filter-sidebar/job-filter-sidebar.component';
import { JobResultsComponent } from '../job-results/job-results.component';
import { ExternalJobCardComponent } from '../external-job-card/external-job-card.component';
import { ExternalJob } from '../../models/external-job.model';
import { ExternalJobService } from '../../services/external-job.service';
import { PaginationComponent } from '../pagination/pagination.component';

const postedDaysByFilter: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30 };

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [
    JobSearchComponent,
    JobFilterSidebarComponent,
    JobResultsComponent,
    ExternalJobCardComponent,
    PaginationComponent,
  ],
  templateUrl: './jobs-page.component.html',
  styleUrl: './jobs-page.component.scss',
})
export class JobsPageComponent implements OnInit {
  keyword = '';
  location = '';
  page = 0;
  size = 10;
  opportunities: Opportunity[] = [];
  readonly externalPageSize = 24;
  totalElements = 0;
  loading = true;
  error = '';
  filters: JobFilters = {
    workMode: '',
    experience: '',
    employmentType: '',
    opportunityType: '',
    company: '',
    skills: '',
    minSalary: '',
    maxSalary: '',
    postedWithin: '',
    categoryId: '',
  };
  private readonly data = inject(OpportunityService);
  private readonly externalData = inject(ExternalJobService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly filtersOpen = signal(false);
  private readonly activeQuery = signal<OpportunityQuery>({});
  private readonly indiaFeed = toSignal(
    this.externalData.getIndiaJobs().pipe(catchError(() => of(null))),
  );
  readonly indiaPage = signal(1);
  readonly indiaJobs = computed(() => {
    const jobs = this.indiaFeed();
    const query = this.activeQuery();
    return jobs?.filter((job) => this.matchesIndiaJob(job, query)) ?? jobs;
  });
  readonly indiaTotal = computed(() => this.indiaFeed()?.length ?? 0);
  readonly visibleIndiaJobs = computed(() => {
    const start = (this.indiaPage() - 1) * this.externalPageSize;
    return this.indiaJobs()?.slice(start, start + this.externalPageSize) ?? [];
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map(
          (params) =>
            ({
              keyword: params.get('keyword') ?? '',
              role: params.get('role') ?? '',
              skills: params.getAll('skills'),
              company: params.get('company') ?? '',
              location: params.get('location') ?? '',
              categoryId: this.numberParam(params.get('categoryId')),
              minExperience: this.numberParam(params.get('minExperience')),
              maxExperience: this.numberParam(params.get('maxExperience')),
              workMode: (params.get('workMode') || undefined) as WorkMode | undefined,
              employmentType: (params.get('employmentType') || undefined) as
                EmploymentType | undefined,
              opportunityType: (params.get('opportunityType') || undefined) as
                OpportunityType | undefined,
              minSalary: this.numberParam(params.get('minSalary')),
              maxSalary: this.numberParam(params.get('maxSalary')),
              postedWithin: params.get('postedWithin') || undefined,
              page: this.numberParam(params.get('page')) ?? 0,
              size: this.numberParam(params.get('size')) ?? this.size,
              sort: params.getAll('sort'),
            }) satisfies OpportunityQuery,
        ),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap((query) => {
          const { page, size, sort, ...externalFilters } = query;
          if (JSON.stringify(externalFilters) !== JSON.stringify(this.activeQuery())) {
            this.activeQuery.set(externalFilters);
            this.indiaPage.set(1);
          }
          this.loading = true;
          this.error = '';
          this.keyword = query.keyword ?? '';
          this.location = query.location ?? '';
          this.page = page;
          this.size = size;
          this.filters = {
            workMode: query.workMode ?? '',
            employmentType: query.employmentType ?? '',
            opportunityType: query.opportunityType ?? '',
            company: query.company ?? '',
            skills: Array.isArray(query.skills) ? query.skills.join(',') : (query.skills ?? ''),
            minSalary: query.minSalary?.toString() ?? '',
            maxSalary: query.maxSalary?.toString() ?? '',
            postedWithin: query.postedWithin ?? '',
            categoryId: query.categoryId?.toString() ?? '',
            experience:
              query.minExperience === undefined
                ? ''
                : `${query.minExperience}-${query.maxExperience ?? ''}`,
          };
        }),
        switchMap((query) =>
          this.data.getOpportunities(query).pipe(
            map((data) => ({ data, error: '' })),
            catchError((error) => of({ data: null, error: getApiErrorMessage(error) })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.loading = false;
        if (result.data) {
          this.opportunities = result.data.content;
          this.totalElements = result.data.totalElements;
        } else {
          this.opportunities = [];
          this.totalElements = 0;
          this.error = result.error;
        }
        this.changeDetector.markForCheck();
      });
  }
  onSearch(value: { keyword: string; location: string }): void {
    this.updateQuery({ keyword: value.keyword || null, location: value.location || null, page: 0 });
  }
  onLocationPreset(location: 'Hyderabad' | ''): void {
    this.updateQuery({ location: location || null, page: 0 });
  }
  onFilters(filters: JobFilters): void {
    this.filters = filters;
    const [minExperience, maxExperience] = filters.experience
      .split('-')
      .map((value) => Number(value));
    this.updateQuery({
      workMode: filters.workMode || null,
      employmentType: filters.employmentType || null,
      opportunityType: filters.opportunityType || null,
      company: filters.company || null,
      skills: filters.skills || null,
      minSalary: filters.minSalary || null,
      maxSalary: filters.maxSalary || null,
      postedWithin: filters.postedWithin || null,
      categoryId: filters.categoryId || null,
      minExperience: filters.experience ? minExperience : null,
      maxExperience: filters.experience
        ? Number.isFinite(maxExperience)
          ? maxExperience
          : null
        : null,
      page: 0,
    });
  }
  onPageChange(page: number): void {
    this.updateQuery({ page: page - 1 });
  }
  onSortChange(sort: string): void {
    this.updateQuery({ sort, page: 0 });
  }

  private matchesIndiaJob(job: ExternalJob, query: OpportunityQuery): boolean {
    const title = this.searchText(job.title);
    const skills = this.searchText([job.title, job.description, ...job.skills].join(' '));
    const location = this.searchText([job.location, job.country].join(' '));
    const keywordText = this.searchText([skills, job.companyName, location].join(' '));
    const matches = (value: string | undefined, text: string) =>
      this.searchText(value)
        .trim()
        .split(/\s+/)
        .every((word) => text.includes(` ${word} `));
    const requestedSkills = [query.skills ?? []].flat().flatMap((value) => value.split(','));
    const rawType = (job.employmentType ?? '').toUpperCase().replace(/[^A-Z]/g, '');
    const type = rawType.endsWith('FULLTIME')
      ? 'FULL_TIME'
      : rawType.endsWith('PARTTIME')
        ? 'PART_TIME'
        : rawType;
    const opportunityType = type === 'INTERNSHIP' ? 'INTERNSHIP' : 'JOB';
    const postedDays = postedDaysByFilter[query.postedWithin ?? ''];
    return (
      (!query.keyword?.trim() || matches(query.keyword, keywordText)) &&
      (!query.role?.trim() || matches(query.role, title)) &&
      (!query.location?.trim() || matches(query.location, location)) &&
      (!query.company?.trim() || matches(query.company, this.searchText(job.companyName))) &&
      requestedSkills.every((value) => !value.trim() || matches(value, skills)) &&
      (query.categoryId === undefined || query.categoryId === job.categoryId) &&
      (!query.workMode || query.workMode === job.workMode) &&
      (!query.employmentType || query.employmentType === type) &&
      (!query.opportunityType || query.opportunityType === opportunityType) &&
      (query.minExperience === undefined ||
        (job.maxExperience ?? -Infinity) >= query.minExperience) &&
      (query.maxExperience === undefined ||
        (job.minExperience ?? Infinity) <= query.maxExperience) &&
      (query.minSalary === undefined || (job.maxMonthlySalary ?? -Infinity) >= query.minSalary) &&
      (query.maxSalary === undefined || (job.minMonthlySalary ?? Infinity) <= query.maxSalary) &&
      (!postedDays || Date.parse(job.postedAt ?? '') >= Date.now() - postedDays * 86_400_000)
    );
  }

  private searchText(value?: string | null): string {
    return ` ${(value ?? '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}+#]+/gu, ' ')
      .trim()} `;
  }

  private updateQuery(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
  private numberParam(value: string | null): number | undefined {
    if (value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
