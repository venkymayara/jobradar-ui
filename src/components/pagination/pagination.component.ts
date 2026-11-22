import { Component, input, output } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  imports: [MatPaginatorModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly length = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly label = input('Pagination');
  readonly disabled = input(false);
  readonly pageChange = output<number>();
}
