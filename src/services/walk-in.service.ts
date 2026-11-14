import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/pagination.model';
import { WalkInDrive, WalkInQuery } from '../models/walk-in.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WalkInService {
  private readonly api = inject(ApiService);
  getUpcoming(query: WalkInQuery = {}): Observable<PageResponse<WalkInDrive>> { return this.api.get<PageResponse<WalkInDrive>>('/walk-ins/upcoming', query); }
  getToday(query: WalkInQuery = {}): Observable<WalkInDrive[]> { return this.api.get<WalkInDrive[]>('/walk-ins/today', query); }
  getById(id: number): Observable<WalkInDrive> { return this.api.get<WalkInDrive>(`/walk-ins/${id}`); }
}
