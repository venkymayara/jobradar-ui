import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Opportunity } from '../../models/opportunity.model';
import { OpportunityCardComponent } from '../opportunity-card/opportunity-card.component';

@Component({
  selector: 'app-latest-opportunities',
  standalone: true,
  imports: [OpportunityCardComponent, RouterLink],
  templateUrl: './latest-opportunities.component.html',
  styleUrl: './latest-opportunities.component.scss'
})
export class LatestOpportunitiesComponent { @Input() jobs: Opportunity[] = []; @Input() loading = false; @Input() error = ''; }
