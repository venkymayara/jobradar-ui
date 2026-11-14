import { JobRole } from './role.model';
import { Skill } from './skill.model';

export type OpportunityType = 'JOB' | 'WALK_IN' | 'INTERNSHIP' | 'REFERRAL';
export type WorkMode = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
export type OpportunityStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'CLOSED' | 'REJECTED';

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
  publishedAt: string;
  applicationDeadline: string | null;
  skills: Skill[];
  roles: JobRole[];
  status: OpportunityStatus;
}

export interface OpportunityQuery {
  keyword?: string;
  role?: string;
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
