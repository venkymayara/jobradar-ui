import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WalkInQuery } from '../../models/walk-in.model';

@Component({
  selector: 'app-walk-in-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './walk-in-filter.component.html',
  styleUrl: './walk-in-filter.component.scss',
})
export class WalkInFilterComponent {
  city = 'Hyderabad';
  date = '';
  role = '';
  skills = '';
  experience = '';
  @Output() filtersChange = new EventEmitter<WalkInQuery>();
  apply(): void {
    const [minExperience, maxExperience] = this.experience.split('-').map(Number);
    this.filtersChange.emit({
      location: this.city || undefined,
      date: this.date || undefined,
      role: this.role || undefined,
      skills: this.skills.trim()
        ? this.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
        : undefined,
      minExperience: this.experience ? minExperience : undefined,
      maxExperience: this.experience && Number.isFinite(maxExperience) ? maxExperience : undefined,
    });
  }
}
