import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './job-search.component.html',
  styleUrl: './job-search.component.scss'
})
export class JobSearchComponent {
  @Input() keyword = '';
  @Input() location = '';
  @Output() search = new EventEmitter<{ keyword: string; location: string }>();
  submit(): void { this.search.emit({ keyword: this.keyword, location: this.location }); }
}
