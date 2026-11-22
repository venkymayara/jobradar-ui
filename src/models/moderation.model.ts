export type ReportStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED';
export type ReportReason =
  | 'FAKE_JOB'
  | 'EXPIRED'
  | 'WRONG_INFORMATION'
  | 'DUPLICATE'
  | 'SUSPICIOUS_PAYMENT'
  | 'MISLEADING_SALARY'
  | 'BROKEN_URL'
  | 'INAPPROPRIATE_CONTENT';

export interface ModerationReport {
  reportId: number;
  opportunityId: number;
  opportunityTitle: string;
  reason: ReportReason | string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface UpdateReportRequest {
  status: ReportStatus;
}

export interface CreateReportRequest {
  reason: ReportReason;
  details?: string;
}
export interface ModeratorPermission {
  userId: number;
  email: string;
  moderator: boolean;
  updatedBy: string;
}
