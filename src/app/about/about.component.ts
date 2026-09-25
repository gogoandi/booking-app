import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {}