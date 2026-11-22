import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Skill } from '../../models/skill.model';

@Component({
  selector: 'app-popular-skills',
  standalone: true,
  templateUrl: './popular-skills.component.html',
  styleUrl: './popular-skills.component.scss',
})
export class PopularSkillsComponent {
  @Input() skills: Skill[] = [];
  @Input() loading = false;
  @Input() error = '';
  constructor(private readonly router: Router) {}
  search(skill: string): void {
    this.router.navigate(['/jobs'], { queryParams: { skill } });
  }
}
