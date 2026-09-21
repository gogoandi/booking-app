import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HotelComponent } from './hotel/hotel.component';
import { HotelModel } from './hotel.model';
import { HotelsService } from './hotels.service';

@Component({
  selector: 'app-hotels',
  imports: [HotelComponent],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css',
})
export class HotelsComponent implements OnInit {
  private readonly hotelsService = inject(HotelsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly hotels = signal<HotelModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.hotelsService.getHotels()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (hotels) => {
          this.hotels.set(hotels);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Hotels could not be loaded. Please try again later.');
          this.loading.set(false);
        },
      });
  }
}
