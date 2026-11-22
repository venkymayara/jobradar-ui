export interface User {
  userId: number;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  professionalHeadline?: string | null;
  skills?: string | null;
  experienceYears?: number | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  roles: string[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthCredentials {
  displayName: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  sessionExpiresIn?: number;
  user: User;
}

export interface DashboardSummary {
  publishedOpportunityCount: number;
  savedOpportunityCount: number;
  pendingReportCount: number;
  activeOpportunityCount?: number;
  pendingOpportunityCount?: number;
  totalViews?: number;
}
