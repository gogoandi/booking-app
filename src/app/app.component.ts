import { Component, signal } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HeroComponent } from './hero/hero.component';
import { SearchEngineComponent } from './search-enginge/search-engine.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, HeroComponent, SearchEngineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  protected readonly title = signal('booking-app');
}
