import { inject, Injectable } from '@angular/core';
import { Observable, Subject, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { Notification, NotificationPage } from '../models/notification.model';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly changes = new Subject<void>();
  readonly changes$ = this.changes.asObservable();
  list(page = 0, size = 20): Observable<NotificationPage> {
    return this.api
      .get<ApiResponse<NotificationPage>>('/notifications', { page, size })
      .pipe(map((r) => r.data));
  }
  unreadCount(): Observable<number> {
    return this.api
      .get<ApiResponse<number>>('/notifications/unread-count')
      .pipe(map((r) => r.data));
  }
  markRead(id: number): Observable<Notification> {
    return this.api.patch<ApiResponse<Notification>, null>(`/notifications/${id}/read`, null).pipe(
      map((r) => r.data),
      tap(() => this.changes.next()),
    );
  }
  markAllRead(): Observable<void> {
    return this.api.patch<ApiResponse<null>, null>('/notifications/read-all', null).pipe(
      map(() => undefined),
      tap(() => this.changes.next()),
    );
  }
  remove(id: number): Observable<void> {
    return this.api.delete<ApiResponse<null>>(`/notifications/${id}`).pipe(
      map(() => undefined),
      tap(() => this.changes.next()),
    );
  }
}
