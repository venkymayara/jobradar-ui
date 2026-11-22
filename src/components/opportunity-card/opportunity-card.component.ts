import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Opportunity } from '../../models/opportunity.model';

@Component({
  selector: 'app-opportunity-card',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent],
  templateUrl: './opportunity-card.component.html',
  styleUrl: './opportunity-card.component.scss',
})
export class OpportunityCardComponent {
  @Input({ required: true }) opportunity!: Opportunity;
  get experienceLabel(): string {
    if (this.opportunity.minExperience === this.opportunity.maxExperience)
      return `${this.opportunity.minExperience} years`;
    return `${this.opportunity.minExperience}–${this.opportunity.maxExperience} years`;
  }
  get salaryLabel(): string {
    const { minSalary, maxSalary, currencyCode } = this.opportunity;
    if (minSalary == null && maxSalary == null) return 'Salary not disclosed';
    const currency = currencyCode || 'INR';
    const format = (value: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    if (minSalary != null && maxSalary != null) return `${format(minSalary)}–${format(maxSalary)}`;
    return format(minSalary ?? maxSalary ?? 0);
  }
}
import { IconComponent } from '../icon.component';
