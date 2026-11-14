import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Opportunity } from '../../models/opportunity.model';
import { OpportunityCardComponent } from '../opportunity-card/opportunity-card.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-job-results',
  standalone: true,
  imports: [OpportunityCardComponent, PaginationComponent],
  templateUrl: './job-results.component.html',
  styleUrl: './job-results.component.scss'
})
export class JobResultsComponent {
  @Input() opportunities: Opportunity[] = [];
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() error = '';
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  onSort(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.sortChange.emit(target.value);
  }
}
