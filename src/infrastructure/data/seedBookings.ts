import { Booking } from '../../domain/booking/Booking';
import {
  BookingRequest,
  type BookingTourParameters,
} from '../../domain/booking/BookingRequest';
import type { Tour } from '../../domain/catalog/Tour';
import { USER_IDS } from './seedIds';
import { addDays, toIsoDate } from '../../shared/utils/dates';

const createDefaultTourParameters = (tour: Tour): BookingTourParameters => {
  switch (tour.getKind()) {
    case 'featured':
      return {
        roomType: 'double-room',
        mealPlan: 'breakfast',
      };
    case 'seasonal':
      return {
        seasonalRoute: 'summer-coast',
      };
    case 'premium':
      return {
        personalGuide: 'local-expert',
        serviceLevel: 'executive',
      };
    default:
      return {};
  }
};

export const createSeedBookings = (tours: Tour[]): Booking[] => {
  const firstTour = tours.find((tour) => tour.getId() === 'tour-vatican') ?? tours[0];
  const secondTour =
    tours.find((tour) => tour.getId() === 'tour-maldives') ?? tours[1];

  const firstBooking = firstTour.createBooking(
    USER_IDS.primaryTraveler,
    new BookingRequest(
      toIsoDate(addDays(new Date(), 7)),
      toIsoDate(addDays(new Date(), 11)),
      '12:00',
      {
        adults: 2,
        youths: 0,
        children: 0,
      },
      {
        servicePerBooking: true,
        servicePerPerson: false,
      },
      createDefaultTourParameters(firstTour),
    ),
  );

  firstBooking.confirm();

  const secondBooking = secondTour.createBooking(
    USER_IDS.secondaryTraveler,
    new BookingRequest(
      toIsoDate(addDays(new Date(), 14)),
      toIsoDate(addDays(new Date(), 20)),
      '19:00',
      {
        adults: 2,
        youths: 1,
        children: 0,
      },
      {
        servicePerBooking: true,
        servicePerPerson: true,
      },
      createDefaultTourParameters(secondTour),
    ),
  );

  secondBooking.confirm();

  return [firstBooking, secondBooking];
};
