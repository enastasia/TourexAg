import type { Booking } from '../../domain/booking/Booking';

export interface IBookingRepository {
  getAll(): Booking[];
  addMany(bookings: Booking[]): void;
}
