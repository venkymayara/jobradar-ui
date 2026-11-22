import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalkInDrive } from '../../models/walk-in.model';

@Component({
  selector: 'app-walk-in-card',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent],
  templateUrl: './walk-in-card.component.html',
  styleUrl: './walk-in-card.component.scss',
})
export class WalkInCardComponent {
  @Input({ required: true }) drive!: WalkInDrive;
}
import { IconComponent } from '../icon.component';
