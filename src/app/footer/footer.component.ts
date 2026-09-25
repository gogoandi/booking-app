import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/auth.service';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  currentYear = new Date().getFullYear();

  user = toSignal(this.authService.user, {
    initialValue: null
  });

  isAuthenticated(): boolean {
    return !!this.user();
  }

  onLogout(): void {
    this.authService.logout();
  }

}