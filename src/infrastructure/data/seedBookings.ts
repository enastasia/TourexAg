import { Booking, type BookingPrimitives } from '../../domain/booking/Booking';
import { BookingRequest } from '../../domain/booking/BookingRequest';
import type { Tour } from '../../domain/catalog/Tour';
import { SEED_IDS } from './seedIds';

const createConfirmedBooking = (
  primitiveOverrides: Pick<BookingPrimitives, 'id' | 'createdAt' | 'updatedAt'>,
  tour: Tour,
  request: BookingRequest,
): Booking => {
  const draftBooking = tour.createBooking(SEED_IDS.people.traveler, request);

  draftBooking.confirm();

  return Booking.restore({
    ...draftBooking.toPrimitives(),
    ...primitiveOverrides,
    status: 'confirmed',
  });
};

export const createSeedBookings = (tours: Tour[]): Booking[] => {
  const tourMap = new Map(tours.map((tour) => [tour.getId(), tour]));
  const maldives = tourMap.get(SEED_IDS.tours.maldives);
  const paris = tourMap.get(SEED_IDS.tours.paris);

  if (!maldives || !paris) {
    return [];
  }

  return [
    createConfirmedBooking(
      {
        id: 'booking_seed_maldives',
        createdAt: '2026-02-15T10:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
      },
      maldives,
      new BookingRequest(
        '2026-08-15',
        '2026-08-20',
        '12:00',
        {
          adults: 2,
          children: 0,
        },
        {
          servicePerBooking: true,
          servicePerPerson: false,
        },
        {
          roomType: 'suite',
          mealPlan: 'breakfast',
        },
      ),
    ),
    createConfirmedBooking(
      {
        id: 'booking_seed_paris',
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z',
      },
      paris,
      new BookingRequest(
        '2026-09-10',
        '2026-09-13',
        '19:00',
        {
          adults: 2,
          children: 0,
        },
        {
          servicePerBooking: false,
          servicePerPerson: true,
        },
      ),
    ),
  ];
};
