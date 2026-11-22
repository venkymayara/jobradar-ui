import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-card.component.html',
  styleUrl: './role-card.component.scss',
})
export class RoleCardComponent {
  @Input({ required: true }) category!: Category;
}
