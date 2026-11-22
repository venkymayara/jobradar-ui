import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ExternalJob } from '../models/external-job.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ExternalJobService {
  private readonly api = inject(ApiService);

  getIndiaJobs(): Observable<ExternalJob[]> {
    const india = this.api.get<ApiResponse<ExternalJob[]>>('/external-jobs/india').pipe(
      map(({ data }) => data),
      catchError(() => of(null)),
    );
    const cached = this.api
      .get<ApiResponse<PageResponse<ExternalJob>>>('/external-jobs', { size: 6 })
      .pipe(
        map(({ data }) => data.content.filter(isAvailableInIndia)),
        catchError(() => of(null)),
      );

    return forkJoin([india, cached]).pipe(
      map(([indiaJobs, cachedJobs]) => {
        if (indiaJobs === null && !cachedJobs?.length) {
          throw new Error('External jobs unavailable');
        }
        const unique = new Map<string, ExternalJob>();
        for (const job of [...(indiaJobs ?? []), ...(cachedJobs ?? [])]) {
          const key = jobLinkKey(job);
          if (!unique.has(key)) unique.set(key, job);
        }
        return [...unique.values()];
      }),
    );
  }

  getIndiaJobCategoryCounts(): Observable<Record<number, number>> {
    return this.api
      .get<ApiResponse<Record<number, number>>>('/external-jobs/india/category-counts')
      .pipe(map((response) => response.data));
  }
}

function isAvailableInIndia(job: ExternalJob): boolean {
  const location = [job.location, job.country].filter(Boolean).join(' ');
  return (
    /\bindia\b|\b(?:worldwide|global|anywhere in the world)\b|^anywhere$/i.test(location) &&
    !/\b(?:except|excluding|outside)\s+india\b/i.test(location)
  );
}

function jobLinkKey(job: ExternalJob): string {
  try {
    const url = new URL(job.jobUrl || job.applicationUrl);
    url.hash = '';
    for (const name of [...url.searchParams.keys()]) {
      if (name.toLowerCase().startsWith('utm_')) url.searchParams.delete(name);
    }
    url.searchParams.sort();
    return url.href;
  } catch {
    return `${job.provider}:${job.externalId}`;
  }
}
