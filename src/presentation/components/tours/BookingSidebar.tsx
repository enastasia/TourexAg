import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookingRequest,
  TOUR_TYPE_FIELD_MAPPING,
  type BookingTourParameters,
} from '../../../domain/booking/BookingRequest';
import type { Tour } from '../../../domain/catalog/Tour';
import { addDays, toIsoDate } from '../../../shared/utils/dates';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useAppStore } from '../../hooks/useAppStore';
import { TOUR_PARAMETER_FIELD_CONFIG } from './bookingTourFields';

interface BookingSidebarProps {
  tour: Tour;
}

export const BookingSidebar = ({ tour }: BookingSidebarProps) => {
  const {
    state: { currentPerson },
    store,
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [travelDate, setTravelDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<'12:00' | '19:00'>('12:00');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [servicePerBooking, setServicePerBooking] = useState(false);
  const [servicePerPerson, setServicePerPerson] = useState(false);
  const [tourParameters, setTourParameters] = useState<BookingTourParameters>({});
  const [validationMessage, setValidationMessage] = useState('');
  const tourId = tour.getId();
  const tourKind = tour.getKind();
  const requiredTourParameterFields = TOUR_TYPE_FIELD_MAPPING[tourKind];
  const maxGuests = tour.getGroupSize();

  const checkOutDate = travelDate ? toIsoDate(addDays(travelDate, 2)) : '';

  const request = new BookingRequest(
    travelDate,
    checkOutDate,
    timeSlot,
    {
      adults,
      children,
    },
    {
      servicePerBooking,
      servicePerPerson,
    },
    tourParameters,
  );

  const quote = tour.canBeBooked(request)
    ? tour.quote(request)
    : {
        totalPrice: tour.getDiscountedPrice(),
      };

  const adultOptions = Array.from(
    { length: Math.max(1, maxGuests - children + 1) },
    (_, index) => index,
  );
  const childrenOptions = Array.from(
    { length: Math.max(1, maxGuests - adults + 1) },
    (_, index) => index,
  );

  const unitPrices = useMemo(
    () => ({
      adults: formatCurrency(tour.getDiscountedPrice(), 0),
      children: formatCurrency(tour.getDiscountedPrice() * 0.58, 0),
    }),
    [tour],
  );

  const handleBooking = () => {
    const missingTourParameter = requiredTourParameterFields.find(
      (field) => !tourParameters[field],
    );

    if (missingTourParameter) {
      setValidationMessage(
        TOUR_PARAMETER_FIELD_CONFIG[missingTourParameter].errorMessage,
      );
      return;
    }

    setValidationMessage('');

    const result = store.addToCart(tourId, request);

    if (result.success) {
      navigate('/cart');
      return;
    }

    if (!currentPerson) {
      navigate('/login', {
        state: {
          from: location,
        },
      });
    }
  };

  return (
    <aside className="detail-booking">
      <h3>Book This Tour</h3>

      <label className="detail-booking__date-field">
        <CalendarDays size={16} />
        <input
          type="date"
          value={travelDate}
          min={toIsoDate(new Date())}
          onChange={(event) => setTravelDate(event.target.value)}
          aria-label="When (Date)"
        />
      </label>

      <div className="detail-booking__section detail-booking__section--time">
        <h4>Time:</h4>
        <div className="detail-booking__times">
          {(['12:00', '19:00'] as const).map((slot) => (
            <button
              key={slot}
              type="button"
              className={timeSlot === slot ? 'is-active' : ''}
              onClick={() => setTimeSlot(slot)}
            >
              <span />
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-booking__section">
        <h4>Tickets:</h4>
        <div className="detail-booking__ticket-cap">
          Max {maxGuests} travellers for this tour
        </div>

        <div className="detail-booking__ticket-row">
          <div>
            <strong>Adult</strong>
            <span>(13+ years) {unitPrices.adults}</span>
          </div>
          <select
            value={adults}
            onChange={(event) =>
              setAdults(
                Math.min(Number(event.target.value), maxGuests - children),
              )
            }
          >
            {adultOptions.map((value) => (
              <option key={`adult-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-booking__ticket-row">
          <div>
            <strong>Children</strong>
            <span>(3-12 years) {unitPrices.children}</span>
          </div>
          <select
            value={children}
            onChange={(event) =>
              setChildren(
                Math.min(Number(event.target.value), maxGuests - adults),
              )
            }
          >
            {childrenOptions.map((value) => (
              <option key={`child-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="detail-booking__section">
        <h4>Add Extra:</h4>

        <label className="detail-booking__extra-row">
          <span>
            <input
              type="checkbox"
              checked={servicePerBooking}
              onChange={(event) => setServicePerBooking(event.target.checked)}
            />
            Service Per Booking
          </span>
          <strong>$30.00</strong>
        </label>

        <label className="detail-booking__extra-row">
          <span>
            <input
              type="checkbox"
              checked={servicePerPerson}
              onChange={(event) => setServicePerPerson(event.target.checked)}
            />
            Service Per Person
          </span>
          <strong>$20.00</strong>
        </label>

      </div>

      {requiredTourParameterFields.length > 0 && (
        <div className="detail-booking__section detail-booking__section--parameters">
          <h4>Tour Options:</h4>

          {requiredTourParameterFields.map((field) => {
            const config = TOUR_PARAMETER_FIELD_CONFIG[field];

            return (
              <label key={field} className="detail-booking__option-field">
                <span>{config.label}</span>
                <select
                  value={tourParameters[field] ?? ''}
                  onChange={(event) => {
                    setTourParameters((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }));
                    setValidationMessage('');
                  }}
                  aria-label={config.label}
                >
                  <option value="">{config.placeholder}</option>
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}

      {validationMessage && (
        <p className="detail-booking__error" role="alert">
          {validationMessage}
        </p>
      )}

      <div className="detail-booking__total">
        <span>Total Cost:</span>
        <strong>{formatCurrency(quote.totalPrice, 2)}</strong>
      </div>

      <button
        className="button button--primary detail-booking__button"
        type="button"
        onClick={handleBooking}
      >
        Add to Cart
      </button>
    </aside>
  );
};
