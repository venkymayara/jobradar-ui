import { inject, Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Company } from '../models/company.model';
import { Location } from '../models/location.model';
import { PageResponse } from '../models/pagination.model';
import { JobRole } from '../models/role.model';
import { Skill } from '../models/skill.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);

  walkInOptions() {
    return forkJoin({
      companies: this.list<Company>('/companies'),
      locations: this.list<Location>('/locations'),
      roles: this.list<JobRole>('/roles'),
      skills: this.list<Skill>('/skills'),
    });
  }

  private list<T>(path: string) {
    return this.api.get<ApiResponse<PageResponse<T>>>(path).pipe(map(({ data }) => data.content));
  }
}
