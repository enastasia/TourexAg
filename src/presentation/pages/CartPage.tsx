import { CalendarDays, Trash2, Users } from 'lucide-react';
import {
  BookingRequest,
  TOUR_TYPE_FIELD_MAPPING,
} from '../../domain/booking/BookingRequest';
import { User } from '../../domain/people/User';
import { formatCurrency } from '../../shared/utils/formatters';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { EmptyState } from '../components/common/EmptyState';
import {
  TOUR_PARAMETER_FIELD_CONFIG,
  getTourParameterOptionLabel,
} from '../components/tours/bookingTourFields';
import { useAppStore } from '../hooks/useAppStore';

const CounterField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) => (
  <label className="cart-line__counter">
    <span>{label}</span>
    <div>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}>
        -
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  </label>
);

export const CartPage = () => {
  const { state, store } = useAppStore();

  if (!(state.currentPerson instanceof User) || !state.currentCart) {
    return null;
  }

  const cart = state.currentCart;
  const lines = cart.getLines();

  return (
    <>
      <BreadcrumbHero
        eyebrow="Review Your Booking"
        title="Your Cart"
        image={state.tours[0]?.getHeroImage() ?? ''}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'Cart' },
        ]}
      />

      <section className="section">
        <div className="container cart-layout">
          <div className="cart-layout__main">
            {lines.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                description="Tours only enter the cart after a complete, valid booking request."
                actionLabel="Explore Tours"
                actionHref="/tours"
              />
            ) : (
              lines.map((booking) => {
                const request = booking.getRequest().toPrimitives();
                const selectedTourParameterFields = TOUR_TYPE_FIELD_MAPPING[
                  booking.getTourKind()
                ].filter((field) => request.tourParameters[field]);

                const updateRequest = (
                  changes: Partial<typeof request>,
                  ticketChanges?: Partial<typeof request.tickets>,
                  extraChanges?: Partial<typeof request.extras>,
                ) => {
                  store.updateCartBooking(
                    booking.getId(),
                    BookingRequest.restore({
                      ...request,
                      ...changes,
                      tickets: {
                        ...request.tickets,
                        ...ticketChanges,
                      },
                      extras: {
                        ...request.extras,
                        ...extraChanges,
                      },
                    }),
                  );
                };

                return (
                  <article key={booking.getId()} className="cart-line">
                    <img src={booking.getCoverImage()} alt={booking.getTourTitle()} />
                    <div className="cart-line__content">
                      <div className="cart-line__header">
                        <div>
                          <h2>{booking.getTourTitle()}</h2>
                          <p>{booking.getDestinationLabel()}</p>
                        </div>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => store.removeFromCart(booking.getId())}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="cart-line__meta">
                        <span>
                          <CalendarDays size={16} />
                          {request.checkInDate} → {request.checkOutDate}
                        </span>
                        <span>
                          <Users size={16} />
                          {request.tickets.adults + request.tickets.children} Guests
                        </span>
                      </div>

                      {selectedTourParameterFields.length > 0 && (
                        <div className="cart-line__tour-options">
                          {selectedTourParameterFields.map((field) => (
                            <span key={field}>
                              <strong>{TOUR_PARAMETER_FIELD_CONFIG[field].label}:</strong>{' '}
                              {getTourParameterOptionLabel(
                                field,
                                request.tourParameters[field] ?? '',
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="cart-line__edit-grid">
                        <CounterField
                          label="Adults"
                          value={request.tickets.adults}
                          onChange={(next) => updateRequest({}, { adults: next })}
                        />
                        <CounterField
                          label="Children"
                          value={request.tickets.children}
                          onChange={(next) => updateRequest({}, { children: next })}
                        />
                        <label>
                          <span>Check In</span>
                          <input
                            type="date"
                            value={request.checkInDate}
                            onChange={(event) =>
                              updateRequest({ checkInDate: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Check Out</span>
                          <input
                            type="date"
                            value={request.checkOutDate}
                            onChange={(event) =>
                              updateRequest({ checkOutDate: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Time</span>
                          <select
                            value={request.timeSlot}
                            onChange={(event) =>
                              updateRequest({
                                timeSlot: event.target.value as '12:00' | '19:00',
                              })
                            }
                          >
                            <option value="12:00">12:00</option>
                            <option value="19:00">19:00</option>
                          </select>
                        </label>
                      </div>

                      <div className="cart-line__extras">
                        <label>
                          <input
                            type="checkbox"
                            checked={request.extras.servicePerBooking}
                            onChange={(event) =>
                              updateRequest(
                                {},
                                undefined,
                                { servicePerBooking: event.target.checked },
                              )
                            }
                          />
                          Service Per Booking
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={request.extras.servicePerPerson}
                            onChange={(event) =>
                              updateRequest(
                                {},
                                undefined,
                                { servicePerPerson: event.target.checked },
                              )
                            }
                          />
                          Service Per Person
                        </label>
                      </div>

                      <div className="cart-line__price">
                        <span>{formatCurrency(booking.getUnitPrice())} / person</span>
                        <strong>{formatCurrency(booking.getTotalPrice(), 2)}</strong>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div>
              <span>Items</span>
              <strong>{cart.getItemsCount()}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatCurrency(cart.getTotalPrice(), 2)}</strong>
            </div>
            <button className="button button--primary" type="button" onClick={() => store.checkoutCart()}>
              Complete Checkout
            </button>
          </aside>
        </div>
      </section>
    </>
  );
};
