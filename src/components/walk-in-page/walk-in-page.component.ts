import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, Subject, switchMap, tap } from 'rxjs';
import { WalkInDrive, WalkInQuery } from '../../models/walk-in.model';
import { WalkInService } from '../../services/walk-in.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { WalkInFilterComponent } from '../walk-in-filter/walk-in-filter.component';
import { WalkInCalendarComponent } from '../walk-in-calendar/walk-in-calendar.component';
import { WalkInCardComponent } from '../walk-in-card/walk-in-card.component';

@Component({
  selector: 'app-walk-in-page',
  standalone: true,
  imports: [WalkInFilterComponent, WalkInCalendarComponent, WalkInCardComponent],
  templateUrl: './walk-in-page.component.html',
  styleUrl: './walk-in-page.component.scss'
})
export class WalkInPageComponent implements OnInit {
  private readonly data = inject(WalkInService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<WalkInQuery>();
  filtered: WalkInDrive[] = [];
  loading = true;
  error = '';
  ngOnInit(): void {
    this.requests.pipe(tap(() => { this.loading = true; this.error = ''; }),
      switchMap(query => this.data.getUpcoming(query).pipe(
        catchError(error => of({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true, message: getApiErrorMessage(error) }))
      )), takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      this.loading = false;
      if ('message' in response) { this.filtered = []; this.error = response.message; }
      else this.filtered = response.content;
    });
    this.requests.next({ location: 'Hyderabad', page: 0, size: 10 });
  }
  filterDrives(filters: WalkInQuery): void { this.requests.next({ ...filters, page: 0, size: 10 }); }
}
