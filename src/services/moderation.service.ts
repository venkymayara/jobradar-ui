import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Opportunity, OpportunityStatus } from '../models/opportunity.model';
import {
  ModerationReport,
  ModeratorPermission,
  UpdateReportRequest,
} from '../models/moderation.model';
import { PageRequest, PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REQUEST_DETAILS';
export type ReviewQueueStatus = 'PENDING' | 'NEEDS_DETAILS';
export interface OpportunityReview {
  opportunity: Opportunity;
  submittedBy: string;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly api = inject(ApiService);
  getOpportunityQueue(
    status: ReviewQueueStatus,
    page: number,
  ): Observable<PageResponse<Opportunity>> {
    return this.api
      .get<ApiResponse<PageResponse<Opportunity>>>('/admin/opportunities/review-queue', {
        status,
        page,
      })
      .pipe(map((response) => response.data));
  }

  getOpportunityReview(id: number): Observable<OpportunityReview> {
    return this.api
      .get<ApiResponse<OpportunityReview>>(`/admin/opportunities/${id}`)
      .pipe(map((response) => response.data));
  }

  reviewOpportunity(id: number, decision: ReviewDecision, note: string): Observable<Opportunity> {
    return this.api
      .patch<ApiResponse<Opportunity>, { decision: ReviewDecision; note: string }>(
        `/admin/opportunities/${id}/review`,
        { decision, note },
      )
      .pipe(map((response) => response.data));
  }
  getReports(page: PageRequest = {}): Observable<PageResponse<ModerationReport>> {
    return this.api
      .get<ApiResponse<PageResponse<ModerationReport>>>('/moderation/reports', page)
      .pipe(map((response) => response.data));
  }
  getReport(reportId: number): Observable<ModerationReport> {
    return this.api
      .get<ApiResponse<ModerationReport>>(`/moderation/reports/${reportId}`)
      .pipe(map((response) => response.data));
  }
  updateReport(reportId: number, request: UpdateReportRequest): Observable<ModerationReport> {
    return this.api
      .patch<ApiResponse<ModerationReport>, UpdateReportRequest>(
        `/moderation/reports/${reportId}`,
        request,
      )
      .pipe(map((response) => response.data));
  }
  updateOpportunityStatus(
    opportunityId: number,
    status: OpportunityStatus,
  ): Observable<Opportunity> {
    return this.api
      .patch<ApiResponse<Opportunity>, { status: OpportunityStatus }>(
        `/moderation/opportunities/${opportunityId}/status`,
        { status },
      )
      .pipe(map((response) => response.data));
  }
  setModeratorPermission(userId: number, enabled: boolean): Observable<ModeratorPermission> {
    return this.api
      .put<ApiResponse<ModeratorPermission>, { enabled: boolean }>(
        `/admin/users/${userId}/moderator-permission`,
        { enabled },
      )
      .pipe(map((response) => response.data));
  }
}
