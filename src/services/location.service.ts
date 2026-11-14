import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly api = inject(ApiService);
  getLocations(keyword?: string): Observable<Location[]> { return this.api.get<Location[]>('/locations', { keyword }); }
}
