import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModerationReport, UpdateReportRequest } from '../models/moderation.model';
import { PageRequest, PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly api = inject(ApiService);
  getReports(page: PageRequest = {}): Observable<PageResponse<ModerationReport>> { return this.api.get<PageResponse<ModerationReport>>('/moderation/reports', page); }
  updateReport(reportId: number, request: UpdateReportRequest): Observable<ModerationReport> { return this.api.patch<ModerationReport, UpdateReportRequest>(`/moderation/reports/${reportId}`, request); }
}
