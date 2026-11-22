import { inject, Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { DashboardSummary, User } from '../models/user.model';
import { Opportunity } from '../models/opportunity.model';
import { ModerationReport } from '../models/moderation.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  getMe(): Observable<User> {
    return this.api.get<ApiResponse<User>>('/users/me').pipe(
      map(({ data }) => data),
      tap((user) => this.auth.updateCurrentUser(user)),
    );
  }
  getDashboard(): Observable<DashboardSummary> {
    return this.api
      .get<ApiResponse<DashboardSummary>>('/users/me/dashboard')
      .pipe(map((response) => response.data));
  }
  getMyOpportunities(page = 0, size = 10): Observable<PageResponse<Opportunity>> {
    return this.api
      .get<ApiResponse<PageResponse<Opportunity>>>('/users/me/opportunities', { page, size })
      .pipe(map((response) => response.data));
  }
  getMyReports(page = 0, size = 10): Observable<PageResponse<ModerationReport>> {
    return this.api
      .get<{ data: PageResponse<ModerationReport> }>('/users/me/reports', { page, size })
      .pipe(map((response) => response.data));
  }
  updateProfile(request: Partial<User>): Observable<User> {
    return this.api.put<ApiResponse<User>, Partial<User>>('/users/me', request).pipe(
      map(({ data }) => data),
      tap((user) => this.auth.updateCurrentUser(user)),
    );
  }
}
