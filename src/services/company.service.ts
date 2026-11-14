import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiService);
  getCompanies(keyword?: string): Observable<Company[]> { return this.api.get<Company[]>('/companies', { keyword }); }
}
