import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { RoleCardComponent } from './role-card.component';

@Component({
  selector: 'app-role-categories',
  standalone: true,
  imports: [RoleCardComponent, RouterLink],
  templateUrl: './role-categories.component.html',
  styleUrl: './role-categories.component.scss',
})
export class RoleCategoriesComponent {
  @Input() categories: Category[] = [];
  @Input() loading = false;
  @Input() error = '';
}
