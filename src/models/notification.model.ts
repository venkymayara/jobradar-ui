import { PageResponse } from './pagination.model';
export type NotificationType =
  | 'OPPORTUNITY_SUBMITTED'
  | 'OPPORTUNITY_APPROVED'
  | 'OPPORTUNITY_REJECTED'
  | 'OPPORTUNITY_PUBLISHED'
  | 'OPPORTUNITY_PAUSED'
  | 'OPPORTUNITY_FILLED'
  | 'OPPORTUNITY_EXPIRING'
  | 'OPPORTUNITY_EXPIRED'
  | 'OPPORTUNITY_REVIEW_REQUESTED'
  | 'OPPORTUNITY_DETAILS_REQUESTED'
  | 'REPORT_UPDATED'
  | 'ACCOUNT';
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceType: string | null;
  referenceId: number | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}
export type NotificationPage = PageResponse<Notification>;
