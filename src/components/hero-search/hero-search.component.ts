import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.scss',
})
export class HeroSearchComponent {
  keyword = '';
  location = 'Hyderabad';
  constructor(private readonly router: Router) {}
  search(): void {
    this.router.navigate(['/jobs'], {
      queryParams: { keyword: this.keyword || null, location: this.location || null },
    });
  }
}
import { IconComponent } from '../icon.component';
