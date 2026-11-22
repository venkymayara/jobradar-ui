import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/pagination.model';
import { WalkInDrive, WalkInQuery } from '../models/walk-in.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WalkInService {
  private readonly api = inject(ApiService);
  list(query: WalkInQuery = {}): Observable<PageResponse<WalkInDrive>> {
    return this.api
      .get<ApiResponse<PageResponse<WalkInDrive>>>('/walk-ins', query)
      .pipe(map((response) => response.data));
  }
  getToday(query: WalkInQuery = {}): Observable<PageResponse<WalkInDrive>> {
    return this.api
      .get<ApiResponse<PageResponse<WalkInDrive>>>('/walk-ins/today', query)
      .pipe(map((response) => response.data));
  }
  getById(id: number): Observable<WalkInDrive> {
    return this.api
      .get<ApiResponse<WalkInDrive>>(`/walk-ins/${id}`)
      .pipe(map((response) => response.data));
  }
}
