import { Component, Input } from '@angular/core';
import { ExternalJob } from '../../models/external-job.model';

@Component({
  selector: 'app-external-job-card',
  standalone: true,
  templateUrl: './external-job-card.component.html',
  styleUrl: './external-job-card.component.scss',
})
export class ExternalJobCardComponent {
  @Input({ required: true }) job!: ExternalJob;
}
