import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
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
  private cachedHome?: Observable<HomeData>;

  getHomeData(): Observable<HomeData> {
    this.cachedHome ??= this.api.get<HomeData>('/home').pipe(shareReplay({ bufferSize: 1, refCount: true }));
    return this.cachedHome;
  }
}
