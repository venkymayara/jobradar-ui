import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { Opportunity } from '../models/opportunity.model';
import { Skill } from '../models/skill.model';
import { WalkInDrive } from '../models/walk-in.model';
import { ApiService } from './api.service';

export interface HomeData {
  categories: Category[];
  latestOpportunities: Opportunity[];
  upcomingWalkIns: WalkInDrive[];
  popularSkills: Skill[];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly api = inject(ApiService);
  getHomeData(): Observable<HomeData> {
    return this.api.get<HomeData>('/home');
  }
}
