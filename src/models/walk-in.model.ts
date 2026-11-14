import { Skill } from './skill.model';

export interface WalkInDrive {
  opportunityId: number;
  title: string;
  companyName: string;
  location: string;
  driveDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  minExperience: number;
  maxExperience: number;
  skills: Skill[];
  instructions: string;
}

export interface WalkInQuery {
  location?: string;
  date?: string;
  role?: string;
  skills?: string | string[];
  minExperience?: number;
  maxExperience?: number;
  page?: number;
  size?: number;
}
