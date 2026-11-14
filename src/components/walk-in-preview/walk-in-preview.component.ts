import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WalkInDrive } from '../../models/walk-in.model';
import { WalkInCardComponent } from '../walk-in-card/walk-in-card.component';

@Component({
  selector: 'app-walk-in-preview',
  standalone: true,
  imports: [WalkInCardComponent, RouterLink],
  templateUrl: './walk-in-preview.component.html',
  styleUrl: './walk-in-preview.component.scss'
})
export class WalkInPreviewComponent { @Input() drives: WalkInDrive[] = []; @Input() loading = false; @Input() error = ''; }
