import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WalkInDrive } from '../../models/walk-in.model';

@Component({
  selector: 'app-walk-in-calendar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './walk-in-calendar.component.html',
  styleUrl: './walk-in-calendar.component.scss'
})
export class WalkInCalendarComponent { @Input() drives: WalkInDrive[] = []; }
