import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Opportunity } from '../models/opportunity.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SavedOpportunityService {
  private readonly api = inject(ApiService);
  getSaved(
    query: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' } = {},
  ): Observable<PageResponse<Opportunity>> {
    return this.api
      .get<ApiResponse<PageResponse<Opportunity>>>('/users/me/saved', query)
      .pipe(map((response) => response.data));
  }
  save(opportunityId: number): Observable<void> {
    return this.api
      .post<ApiResponse<void>>(`/opportunities/${opportunityId}/save`, {})
      .pipe(map(() => undefined));
  }
  remove(opportunityId: number): Observable<void> {
    return this.api
      .delete<ApiResponse<void>>(`/opportunities/${opportunityId}/save`)
      .pipe(map(() => undefined));
  }
}
