import { OpportunityReference } from './opportunity.model';

export interface WalkInDrive {
  opportunityId: number;
  title: string;
  companyId?: number;
  companyName: string;
  companyLogo?: string | null;
  location: string;
  driveDate: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
  driveStartAtUtc: string;
  driveEndAtUtc: string;
  venue: string;
  venueAddress: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  sourceUrl?: string | null;
  status?: string;
  verified?: boolean;
  minExperience: number;
  maxExperience: number;
  skills: OpportunityReference[];
  instructions: string | null;
  roles?: { id: number; name: string; slug: string }[];
}

export interface WalkInQuery {
  keyword?: string;
  location?: string;
  date?: string;
  role?: string;
  company?: string;
  skills?: string | string[];
  minExperience?: number;
  maxExperience?: number;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  size?: number;
  sort?: string | string[];
  direction?: 'ASC' | 'DESC';
}
