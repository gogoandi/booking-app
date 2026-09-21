import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HotelModel } from './hotel.model';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private readonly http = inject(HttpClient);

  getHotels(): Observable<HotelModel[]> {
    return this.http.get<HotelModel[]>('http://localhost:3000/api/hotels');
  }
}
