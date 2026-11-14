import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Opportunity } from '../models/opportunity.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SavedOpportunityService {
  private readonly api = inject(ApiService);
  getSaved(): Observable<Opportunity[]> { return this.api.get<Opportunity[]>('/users/me/saved'); }
  save(opportunityId: number): Observable<void> { return this.api.post<void>(`/opportunities/${opportunityId}/save`, {}); }
  remove(opportunityId: number): Observable<void> { return this.api.delete<void>(`/opportunities/${opportunityId}/save`); }
}
