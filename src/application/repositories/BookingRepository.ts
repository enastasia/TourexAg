import { Booking, type BookingPrimitives } from '../../domain/booking/Booking';
import { BrowserStorageRepository } from './BrowserStorageRepository';
import { normalizeBookingRecord } from './BookingRequestMigration';
import type { IBookingRepository } from './IBookingRepository';

export class BookingRepository extends BrowserStorageRepository<
  Booking,
  BookingPrimitives
> implements IBookingRepository {
  public constructor() {
    super('tourex.bookings');
  }

  public addMany(bookings: Booking[]): void {
    this.saveAll([...this.getAll(), ...bookings]);
  }

  protected deserialize(record: BookingPrimitives): Booking {
    return Booking.restore(normalizeBookingRecord(record));
  }
}
