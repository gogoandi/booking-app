import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/auth.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {

  private authService = inject(AuthService);

  user = toSignal(this.authService.user, {
    initialValue: null,
  });

}