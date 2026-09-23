import { Component } from '@angular/core';
import { HotelsComponent } from '../hotels/hotels.component';
import { SearchEngineComponent } from '../search-enginge/search-engine.component';
import { HeroComponent } from '../hero/hero.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, HotelsComponent, SearchEngineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
