export interface ExternalJob {
  externalId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  salary: string | null;
  skills: string[];
  workMode: string;
  jobUrl: string | null;
  applicationUrl: string;
  provider: string;
  postedAt: string | null;
  fetchedAt: string | null;
  expiresAt: string | null;
  external: boolean;
  categoryId?: number | null;
  minExperience?: number | null;
  maxExperience?: number | null;
  minMonthlySalary?: number | null;
  maxMonthlySalary?: number | null;
}
