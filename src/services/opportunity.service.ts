import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Opportunity, OpportunityQuery } from '../models/opportunity.model';
import { PageResponse } from '../models/pagination.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OpportunityService {
  private readonly api = inject(ApiService);
  getOpportunities(query: OpportunityQuery = {}): Observable<PageResponse<Opportunity>> { return this.api.get<PageResponse<Opportunity>>('/opportunities', query); }
  getLatest(): Observable<Opportunity[]> { return this.api.get<Opportunity[]>('/opportunities/latest'); }
  getById(id: number): Observable<Opportunity> { return this.api.get<Opportunity>(`/opportunities/${id}`); }
}
