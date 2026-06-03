import { CalendarDays, ChevronLeft, ChevronRight, ChevronUp, MapPin, Minus, Pencil, Plus, ShoppingCart, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookingRequest,
  TOUR_TYPE_FIELD_MAPPING,
} from '../../domain/booking/BookingRequest';
import { User } from '../../domain/people/User';
import { formatCurrency } from '../../shared/utils/formatters';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
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
        <Minus size={14} />
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  </label>
);

const CART_ITEMS_PER_PAGE = 3;

export const CartPage = () => {
  const { state, store } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  if (!(state.currentPerson instanceof User) || !state.currentCart) {
    return null;
  }

  const cart = state.currentCart;
  const lines = cart.getLines();
  const totalPages = Math.max(1, Math.ceil(lines.length / CART_ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedLines = lines.slice(
    (safePage - 1) * CART_ITEMS_PER_PAGE,
    safePage * CART_ITEMS_PER_PAGE,
  );

  return (
    <>
      <BreadcrumbHero
        eyebrow="Shopping Cart"
        title="Your Cart"
        image="/assets/hero-slider/slide-6.jpg"
        imagePosition="center 65%"
        overlay="none"
        className="breadcrumb-hero--tours breadcrumb-hero--cart"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tours', href: '/tours' },
          { label: 'Cart' },
        ]}
      />

      <section className="section section--cart">
        <div className="container cart-layout">
  
        {lines.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={48} strokeWidth={1.2} />
            <h2>Your cart is empty</h2>
            <p>Browse our tours and add one to get started.</p>
            <Link className="button button--primary" to="/tours">
              Explore Tours
            </Link>
          </div>
        ) : (
          <div className="cart-layout__body">
            <div className="cart-layout__main">
              {pagedLines.map((booking) => {
                const isExpanded = expandedId === booking.getId();
                const request = booking.getRequest().toPrimitives();
                const isStandard = booking.getTourKind() === 'standard';
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
                  <article key={booking.getId()} className="cart-item">
                    <div className="cart-item__bar">
                      <img
                        className="cart-item__thumb"
                        src={booking.getCoverImage()}
                        alt={booking.getTourTitle()}
                      />
                      <div className="cart-item__info">
                        <strong>{booking.getTourTitle()}</strong>
                        <span className="cart-item__meta">
                          <MapPin size={13} />
                          {booking.getDestinationLabel()}
                        </span>
                        <span className="cart-item__meta">
                          <CalendarDays size={13} />
                          {request.checkInDate} → {request.checkOutDate}
                          <span className="cart-item__meta-sep">·</span>
                          <Users size={13} />
                          {request.tickets.adults + request.tickets.children} guests
                        </span>
                      </div>
                      <strong className="cart-item__price">
                        {formatCurrency(booking.getTotalPrice(), 2)}
                      </strong>
                      <div className="cart-item__actions">
                        <button
                          type="button"
                          className="cart-item__edit"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : booking.getId())
                          }
                          title="Edit booking"
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <Pencil size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="cart-item__remove"
                          onClick={() => store.removeFromCart(booking.getId())}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="cart-item__body">
                        <div className="cart-item__detail-row">
                          <span>Base price</span>
                          <span>{formatCurrency(booking.getUnitPrice())} / person</span>
                        </div>

                        {selectedTourParameterFields.length > 0 && (
                          <div className="cart-line__tour-options">
                            {selectedTourParameterFields.map((field) => (
                              <span key={field}>
                                <strong>
                                  {TOUR_PARAMETER_FIELD_CONFIG[field].label}:
                                </strong>{' '}
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
                              lang="en"
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
                              lang="en"
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

                        {isStandard && (
                          <div className="cart-line__extras">
                            <label>
                              <input
                                type="checkbox"
                                checked={request.extras.servicePerBooking}
                                onChange={(event) =>
                                  updateRequest({}, undefined, {
                                    servicePerBooking: event.target.checked,
                                  })
                                }
                              />
                              Service Per Booking
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={request.extras.servicePerPerson}
                                onChange={(event) =>
                                  updateRequest({}, undefined, {
                                    servicePerPerson: event.target.checked,
                                  })
                                }
                              />
                              Service Per Person
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === safePage ? 'is-active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="cart-summary__rows">
                {lines.map((booking) => (
                  <div key={booking.getId()} className="cart-summary__line">
                    <span>{booking.getTourTitle()}</span>
                    <strong>{formatCurrency(booking.getTotalPrice(), 2)}</strong>
                  </div>
                ))}
              </div>
              <div className="cart-summary__total">
                <span>Total</span>
                <strong>{formatCurrency(cart.getTotalPrice(), 2)}</strong>
              </div>
              <button
                className="button button--primary"
                type="button"
                onClick={() => store.checkoutCart()}
              >
                Complete Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
    </>
  );
};
