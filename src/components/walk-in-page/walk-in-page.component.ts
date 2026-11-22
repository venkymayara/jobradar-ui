import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, Subject, switchMap, tap } from 'rxjs';
import { WalkInDrive, WalkInQuery } from '../../models/walk-in.model';
import { WalkInService } from '../../services/walk-in.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { WalkInFilterComponent } from './walk-in-filter.component';
import { WalkInCalendarComponent } from './walk-in-calendar.component';
import { WalkInCardComponent } from '../walk-in-card/walk-in-card.component';

@Component({
  selector: 'app-walk-in-page',
  standalone: true,
  imports: [WalkInFilterComponent, WalkInCalendarComponent, WalkInCardComponent],
  templateUrl: './walk-in-page.component.html',
  styleUrl: './walk-in-page.component.scss',
})
export class WalkInPageComponent implements OnInit {
  private readonly data = inject(WalkInService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<WalkInQuery>();
  readonly filtered = signal<WalkInDrive[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  ngOnInit(): void {
    this.requests
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set('');
        }),
        switchMap((query) =>
          this.data.list(query).pipe(
            map(({ content }) => ({ drives: content, error: '' })),
            catchError((error: unknown) => of({ drives: [], error: getApiErrorMessage(error) })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ drives, error }) => {
        this.filtered.set(drives);
        this.error.set(error);
        this.loading.set(false);
      });
    this.requests.next({ location: 'Hyderabad', page: 0, size: 10 });
  }
  filterDrives(filters: WalkInQuery): void {
    this.requests.next({ ...filters, page: 0, size: 10 });
  }
}
