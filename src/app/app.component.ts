import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  protected readonly title = signal('booking-app');
  
    router = inject(Router);

    get isAuthPage(): boolean {
        const authRoutes = ['/login', '/register'];
        return authRoutes.includes(this.router.url.split('?')[0]);
    }

    constructor(private authService: AuthService){}
    ngOnInit(): void {
        this.authService.autoLogin();
    }

}
