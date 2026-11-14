import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface JobFilters { workMode: string; experience: string; employmentType: string; opportunityType: string; }
@Component({
  selector: 'app-job-filter-sidebar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './job-filter-sidebar.component.html',
  styleUrl: './job-filter-sidebar.component.scss'
})
export class JobFilterSidebarComponent {
  @Output() filtersChange = new EventEmitter<JobFilters>();
  filters: JobFilters = { workMode: '', experience: '', employmentType: '', opportunityType: '' };
  @Input() set selectedFilters(value: JobFilters) { this.filters = { ...value }; }
  apply(): void { this.filtersChange.emit({ ...this.filters }); }
  reset(): void { this.filters = { workMode: '', experience: '', employmentType: '', opportunityType: '' }; this.apply(); }
}
