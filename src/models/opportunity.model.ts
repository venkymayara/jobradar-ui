export type OpportunityType = 'JOB' | 'WALK_IN' | 'INTERNSHIP' | 'REFERRAL';
export type WorkMode = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
export type OpportunityStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FILLED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'REMOVED'
  | 'NEEDS_DETAILS';
export interface OpportunityReference {
  id: number;
  name: string;
  slug: string;
}
export interface OpportunityStatusHistory {
  previousStatus: OpportunityStatus | null;
  newStatus: OpportunityStatus;
  changedAt: string;
  note?: string | null;
}

export interface Opportunity {
  opportunityId: number;
  title: string;
  companyName: string;
  companyLogo: string | null;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  minExperience: number;
  maxExperience: number;
  minSalary: number | null;
  maxSalary: number | null;
  currencyCode: string;
  opportunityType: OpportunityType;
  description: string;
  applicationUrl: string | null;
  publishedAt: string | null;
  applicationDeadline: string | null;
  skills: OpportunityReference[];
  roles: OpportunityReference[];
  status: OpportunityStatus;
  verified: boolean;
  statusHistory: OpportunityStatusHistory[];
  companyId: number;
  locationId: number;
  sourceUrl: string | null;
  driveDate: string | null;
  driveStartTime: string | null;
  driveEndTime: string | null;
  venue: string | null;
  venueAddress: string | null;
  timeZoneId?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  instructions?: string | null;
  canRespond?: boolean;
}

export function opportunityStatusLabel(status: OpportunityStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Awaiting review';
    case 'NEEDS_DETAILS':
      return 'More details requested';
    case 'ACTIVE':
      return 'Published';
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export interface OpportunityQuery {
  keyword?: string;
  role?: string;
  categoryId?: number;
  skills?: string | string[];
  company?: string;
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  workMode?: WorkMode;
  employmentType?: EmploymentType;
  opportunityType?: OpportunityType;
  minSalary?: number;
  maxSalary?: number;
  postedWithin?: string;
  page?: number;
  size?: number;
  sort?: string | string[];
}
