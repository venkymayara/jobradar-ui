import { Component } from '@angular/core';
import { LogoComponent } from './logo.component';
import { MainNavigationComponent } from './main-navigation.component';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LogoComponent, MainNavigationComponent, UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
