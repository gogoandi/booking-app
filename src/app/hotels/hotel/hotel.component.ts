import { Component, input } from '@angular/core';
import { HotelModel } from '../hotel.model';

@Component({
  selector: 'app-hotel',
  imports: [],
  templateUrl: './hotel.component.html',
  styleUrl: './hotel.component.css',
})
export class HotelComponent {
  readonly hotel = input.required<HotelModel>();
}
