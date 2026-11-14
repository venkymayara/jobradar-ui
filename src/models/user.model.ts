export interface User {
  userId: number;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
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
  user: User;
}

export interface DashboardSummary {
  publishedOpportunityCount: number;
  savedOpportunityCount: number;
  pendingReportCount: number;
}
