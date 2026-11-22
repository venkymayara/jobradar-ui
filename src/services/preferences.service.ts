import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { UserPreferences } from '../models/user-preferences.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly api = inject(ApiService);
  get(): Observable<UserPreferences> {
    return this.api
      .get<ApiResponse<UserPreferences>>('/users/me/preferences')
      .pipe(map((response) => response.data));
  }
  update(preferences: UserPreferences): Observable<UserPreferences> {
    return this.api
      .put<ApiResponse<UserPreferences>, UserPreferences>('/users/me/preferences', preferences)
      .pipe(map((response) => response.data));
  }
}
