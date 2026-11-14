import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Skill } from '../models/skill.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private readonly api = inject(ApiService);
  getSkills(): Observable<Skill[]> { return this.api.get<Skill[]>('/skills'); }
  getPopular(): Observable<Skill[]> { return this.api.get<Skill[]>('/skills/popular'); }
}
