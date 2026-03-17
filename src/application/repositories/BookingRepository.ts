import { Booking, type BookingPrimitives } from '../../domain/booking/Booking';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export class BookingRepository extends BrowserStorageRepository<
  Booking,
  BookingPrimitives
> {
  public constructor() {
    super('tourex.bookings');
  }

  public addMany(bookings: Booking[]): void {
    this.appendMany(bookings);
  }

  protected deserialize(record: BookingPrimitives): Booking {
    return Booking.restore(record);
  }
}
