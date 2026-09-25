import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/auth.service';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {

  private authService = inject(AuthService);

  user = toSignal(this.authService.user, {
    initialValue: null,
  });

}