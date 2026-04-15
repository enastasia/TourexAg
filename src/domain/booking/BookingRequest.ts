import type { ISerializable, IValidatable } from '../shared/contracts';
import type { ValidationError } from '../shared/ValidationError';
import type { TimeSlot, TourKind } from '../../shared/types/domain';
import { differenceInDays, isAtLeastDaysAfter } from '../../shared/utils/dates';

export interface TicketSelection {
  adults: number;
  children: number;
}

export interface BookingExtras {
  servicePerBooking: boolean;
  servicePerPerson: boolean;
}

export type BookingTourParameterKey =
  | 'roomType'
  | 'mealPlan'
  | 'seasonalRoute'
  | 'personalGuide'
  | 'serviceLevel';

export type BookingTourParameters = Partial<Record<BookingTourParameterKey, string>>;

export const TOUR_TYPE_FIELD_MAPPING: Record<TourKind, BookingTourParameterKey[]> = {
  standard: [],
  featured: ['roomType', 'mealPlan'],
  seasonal: ['seasonalRoute'],
  premium: ['personalGuide', 'serviceLevel'],
};

const TOUR_PARAMETER_LABELS: Record<BookingTourParameterKey, string> = {
  roomType: 'room type',
  mealPlan: 'meal plan',
  seasonalRoute: 'seasonal route',
  personalGuide: 'personal guide',
  serviceLevel: 'service level',
};

export interface BookingRequestPrimitives {
  checkInDate: string;
  checkOutDate: string;
  timeSlot: TimeSlot;
  tickets: TicketSelection;
  extras: BookingExtras;
  tourParameters: BookingTourParameters;
}

export class BookingRequest
  implements ISerializable<BookingRequestPrimitives>, IValidatable
{
  public constructor(
    private checkInDate: string,
    private checkOutDate: string,
    private timeSlot: TimeSlot,
    private tickets: TicketSelection,
    private extras: BookingExtras,
    private tourParameters: BookingTourParameters = {},
  ) {}

  public getCheckInDate(): string {
    return this.checkInDate;
  }

  public getCheckOutDate(): string {
    return this.checkOutDate;
  }

  public getTimeSlot(): TimeSlot {
    return this.timeSlot;
  }

  public getTickets(): TicketSelection {
    return { ...this.tickets };
  }

  public getExtras(): BookingExtras {
    return { ...this.extras };
  }

  public getTourParameters(): BookingTourParameters {
    return { ...this.tourParameters };
  }

  public getGuestCount(): number {
    return this.tickets.adults + this.tickets.children;
  }

  public getDurationInDays(): number {
    return differenceInDays(this.checkInDate, this.checkOutDate);
  }

  public isValid(): boolean {
    return this.validate().length === 0;
  }

  public validate(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!this.checkInDate) {
      errors.push({
        field: 'checkInDate',
        message: 'Select a check-in date.',
      });
    }

    if (!this.checkOutDate) {
      errors.push({
        field: 'checkOutDate',
        message: 'Select a check-out date.',
      });
    }

    if (
      this.checkInDate &&
      this.checkOutDate &&
      !isAtLeastDaysAfter(this.checkInDate, this.checkOutDate, 2)
    ) {
      errors.push({
        field: 'checkOutDate',
        message: 'Check-out must be at least 2 days after check-in.',
      });
    }

    if (this.getGuestCount() <= 0) {
      errors.push({
        field: 'tickets',
        message: 'Add at least one traveller before booking.',
      });
    }

    return errors;
  }

  public validateTourParameters(tourKind: TourKind): ValidationError[] {
    return TOUR_TYPE_FIELD_MAPPING[tourKind].reduce<ValidationError[]>((errors, field) => {
      if (!this.tourParameters[field]) {
        errors.push({
          field,
          message: `Select a ${TOUR_PARAMETER_LABELS[field]} before adding this tour to the cart.`,
        });
      }

      return errors;
    }, []);
  }

  public toPrimitives(): BookingRequestPrimitives {
    return {
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      timeSlot: this.timeSlot,
      tickets: this.getTickets(),
      extras: this.getExtras(),
      tourParameters: this.getTourParameters(),
    };
  }

  public static restore(primitives: BookingRequestPrimitives): BookingRequest {
    return new BookingRequest(
      primitives.checkInDate,
      primitives.checkOutDate,
      primitives.timeSlot,
      primitives.tickets,
      primitives.extras,
      primitives.tourParameters ?? {},
    );
  }
}
