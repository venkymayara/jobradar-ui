import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobRole } from '../models/role.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  getRoles(categoryId?: number): Observable<JobRole[]> { return this.api.get<JobRole[]>('/roles', { categoryId }); }
  getBySlug(slug: string): Observable<JobRole> { return this.api.get<JobRole>(`/roles/${encodeURIComponent(slug)}`); }
}
