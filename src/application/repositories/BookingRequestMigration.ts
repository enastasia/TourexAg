import type { BookingPrimitives } from '../../domain/booking/Booking';
import type {
  BookingRequestPrimitives,
  TicketSelection,
} from '../../domain/booking/BookingRequest';
import type { CartPrimitives } from '../../domain/booking/Cart';

type LegacyTicketSelection = Partial<TicketSelection> & {
  youths?: number;
};

type LegacyBookingRequestPrimitives = Omit<BookingRequestPrimitives, 'tickets'> & {
  tickets: LegacyTicketSelection;
};

export const normalizeBookingRecord = (
  record: BookingPrimitives,
): BookingPrimitives => ({
  ...record,
  request: normalizeBookingRequest(record.request as LegacyBookingRequestPrimitives),
});

export const normalizeCartRecord = (record: CartPrimitives): CartPrimitives => ({
  ...record,
  lines: record.lines.map((line) => normalizeBookingRecord(line)),
});

const normalizeBookingRequest = (
  request: LegacyBookingRequestPrimitives,
): BookingRequestPrimitives => ({
  ...request,
  tickets: normalizeTickets(request.tickets),
  tourParameters: request.tourParameters ?? {},
});

const normalizeTickets = (tickets: LegacyTicketSelection): TicketSelection => {
  const adults = Number(tickets?.adults ?? 0);
  const legacyYouths = Number(tickets?.youths ?? 0);
  const children = Number(tickets?.children ?? 0);

  return {
    adults:
      (Number.isFinite(adults) ? adults : 0) +
      (Number.isFinite(legacyYouths) ? legacyYouths : 0),
    children: Number.isFinite(children) ? children : 0,
  };
};
