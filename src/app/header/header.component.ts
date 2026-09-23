import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/button/button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent, RouterLink],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {}
