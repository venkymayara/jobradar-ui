export interface Company {
  companyId: number;
  companyName: string;
  companyLogo?: string | null;
  website?: string | null;
  location?: string | null;
  opportunityCount: number;
}
