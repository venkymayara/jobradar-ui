import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary, User } from '../models/user.model';
import { Opportunity } from '../models/opportunity.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  getMe(): Observable<User> { return this.api.get<User>('/users/me'); }
  getDashboard(): Observable<DashboardSummary> { return this.api.get<DashboardSummary>('/users/me/dashboard'); }
  getMyOpportunities(page = 0, size = 10): Observable<PageResponse<Opportunity>> { return this.api.get<PageResponse<Opportunity>>('/users/me/opportunities', { page, size }); }
}
