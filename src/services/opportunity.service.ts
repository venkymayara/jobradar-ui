import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Opportunity, OpportunityQuery } from '../models/opportunity.model';
import { CreateReportRequest, ModerationReport } from '../models/moderation.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private readonly api = inject(ApiService);
  getOpportunities(query: OpportunityQuery = {}): Observable<PageResponse<Opportunity>> {
    return this.api
      .get<ApiResponse<PageResponse<Opportunity>>>('/opportunities', query)
      .pipe(map((response) => response.data));
  }
  getLatest(): Observable<Opportunity[]> {
    return this.api
      .get<ApiResponse<Opportunity[]>>('/opportunities/latest')
      .pipe(map((response) => response.data));
  }
  getById(id: number): Observable<Opportunity> {
    return this.api
      .get<ApiResponse<Opportunity>>(`/opportunities/${id}`)
      .pipe(map((response) => response.data));
  }
  respondToReview(id: number, message: string): Observable<Opportunity> {
    return this.api
      .post<ApiResponse<Opportunity>, { message: string }>(`/opportunities/${id}/review-response`, {
        message,
      })
      .pipe(map((response) => response.data));
  }
  create(request: CreateOpportunityRequest): Observable<Opportunity> {
    return this.api
      .post<ApiResponse<Opportunity>, CreateOpportunityRequest>('/opportunities', request)
      .pipe(map((response) => response.data));
  }
  report(id: number, request: CreateReportRequest): Observable<ModerationReport> {
    return this.api
      .post<ApiResponse<ModerationReport>, CreateReportRequest>(
        `/opportunities/${id}/report`,
        request,
      )
      .pipe(map((response) => response.data));
  }
}

export interface CreateOpportunityRequest {
  title: string;
  companyId: number | null;
  companyName: string | null;
  locationId: number;
  workMode: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  minExperience: number;
  maxExperience: number;
  minSalary: number | null;
  maxSalary: number | null;
  currencyCode: string;
  opportunityType: 'WALK_IN';
  description: string;
  applicationUrl: string | null;
  sourceUrl: string;
  driveDate: string;
  driveStartTime: string;
  driveEndTime: string;
  venue: string;
  venueAddress: string | null;
  timeZoneId: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  instructions: string | null;
  roleIds: number[];
  skillIds: number[];
}
