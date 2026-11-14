export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface ModerationReport {
  reportId: number;
  opportunityId: number;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reportedAt: string;
}

export interface UpdateReportRequest {
  status: ReportStatus;
  moderatorNote?: string;
}
