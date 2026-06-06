import { DomainException } from './DomainException';

export class BookingException extends DomainException {
  public constructor(message: string) {
    super(message, 'BOOKING_ERROR');
  }
}
