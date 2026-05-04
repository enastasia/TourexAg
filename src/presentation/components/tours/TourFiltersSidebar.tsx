import { BusFront, ChevronDown, Plane, Ship } from 'lucide-react';
import { useState } from 'react';
import type { TourTransportMode } from '../../../shared/types/domain';
import { useAppStore } from '../../hooks/useAppStore';

const PRICE_FILTER_MIN = 0;
const PRICE_FILTER_MAX = 1000;
const TRANSPORT_OPTIONS: Array<{
  value: TourTransportMode;
  label: string;
  Icon: typeof Plane;
}> = [
  { value: 'flightIncluded', label: 'Flight included', Icon: Plane },
  { value: 'busTour', label: 'Bus tour', Icon: BusFront },
  { value: 'cruise', label: 'Cruise', Icon: Ship },
];

export const TourFiltersSidebar = () => {
  const {
    state: { filter },
    store,
  } = useAppStore();
  const meta = store.getCatalogMeta();
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);

  const toggleSelection = (
    list: readonly string[],
    value: string,
    key: 'destinations' | 'transportModes' | 'amenities' | 'languages',
  ) => {
    const next = list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

    store.updateFilter({ [key]: next }, true);
  };

  const toggleDuration = (value: number) => {
    const durations = filter.getDurations();
    const next = durations.includes(value)
      ? durations.filter((item) => item !== value)
      : [...durations, value];

    store.updateFilter({ durations: next }, true);
  };

  const toggleReviewStar = (value: number) => {
    const reviewStars = filter.getReviewStars();
    const next = reviewStars.includes(value)
      ? reviewStars.filter((item) => item !== value)
      : [...reviewStars, value].sort((left, right) => right - left);

    store.updateFilter({ reviewStars: next }, true);
  };

  const setGuests = (value: number) => {
    store.updateFilter({ guests: value }, true);
  };

  const setTransportMode = (value: TourTransportMode) => {
    const next = selectedTransportModes.includes(value) ? [] : [value];
    store.updateFilter({ transportModes: next }, true);
  };

  const handleGuestsInput = (value: string) => {
    if (value.trim() === '') {
      setGuests(0);
      return;
    }

    const normalized = Math.max(1, Math.min(12, Number(value)));

    if (!Number.isNaN(normalized)) {
      setGuests(normalized);
    }
  };

  const [selectedMinimumPrice, selectedMaximumPrice] = filter.getPriceRange();
  const minimumPrice = Math.max(
    PRICE_FILTER_MIN,
    Math.min(PRICE_FILTER_MAX, selectedMinimumPrice),
  );
  const maximumPrice = Math.max(
    minimumPrice,
    Math.min(PRICE_FILTER_MAX, selectedMaximumPrice),
  );
  const minimumThumbPercent =
    ((minimumPrice - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) *
    100;
  const maximumThumbPercent =
    ((maximumPrice - PRICE_FILTER_MIN) / (PRICE_FILTER_MAX - PRICE_FILTER_MIN)) *
    100;

  const setPriceRange = (nextMinimumPrice: number, nextMaximumPrice: number) => {
    store.updateFilter(
      {
        priceRange: [
          Math.max(PRICE_FILTER_MIN, Math.min(nextMinimumPrice, nextMaximumPrice)),
          Math.min(PRICE_FILTER_MAX, Math.max(nextMinimumPrice, nextMaximumPrice)),
        ],
      },
      true,
    );
  };

  const handleMinimumPriceChange = (value: number) => {
    setPriceRange(value, maximumPrice);
  };

  const handleMaximumPriceChange = (value: number) => {
    setPriceRange(minimumPrice, value);
  };

  const selectedDestinations = filter.getDestinations();
  const selectedDurations = filter.getDurations();
  const selectedTransportModes = filter.getTransportModes();
  const selectedAmenities = filter.getAmenities();
  const selectedLanguages = filter.getLanguages();
  const selectedReviewStars = filter.getReviewStars();

  const destinationSummary =
    selectedDestinations.length === 0
      ? 'Choose destinations'
      : selectedDestinations.length === 1
        ? meta.destinations.find(
            (destination) => destination.id === selectedDestinations[0],
          )?.label ?? '1 selected'
        : `${selectedDestinations.length} selected`;

  return (
    <aside className="tour-filters">
      <section>
        <h3>Destination</h3>
        <div className="tour-filters__dropdown">
          <button
            type="button"
            className={`tour-filters__dropdown-trigger ${isDestinationsOpen ? 'is-open' : ''}`}
            onClick={() => setIsDestinationsOpen((current) => !current)}
          >
            <span>{destinationSummary}</span>
            <ChevronDown size={18} />
          </button>
          {isDestinationsOpen ? (
            <div className="tour-filters__dropdown-body tour-filters__stack tour-filters__stack--panel">
              {meta.destinations.map((destination) => (
                <label key={destination.id}>
                  <input
                    type="checkbox"
                    checked={selectedDestinations.includes(destination.id)}
                    onChange={() =>
                      toggleSelection(
                        selectedDestinations,
                        destination.id,
                        'destinations',
                      )
                    }
                  />
                  {destination.label}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="tour-filters__section tour-filters__section--price">
        <h3>Price Range</h3>
        <div className="tour-filters__range-shell">
          <div className="tour-filters__range-slider">
            <div className="tour-filters__range-track" />
            <div
              className="tour-filters__range-progress"
              style={{
                left: `${minimumThumbPercent}%`,
                width: `${maximumThumbPercent - minimumThumbPercent}%`,
              }}
            />
            <input
              className="tour-filters__range-input"
              type="range"
              min={PRICE_FILTER_MIN}
              max={PRICE_FILTER_MAX}
              step={1}
              value={minimumPrice}
              onChange={(event) =>
                handleMinimumPriceChange(Number(event.target.value))
              }
            />
            <input
              className="tour-filters__range-input"
              type="range"
              min={PRICE_FILTER_MIN}
              max={PRICE_FILTER_MAX}
              step={1}
              value={maximumPrice}
              onChange={(event) =>
                handleMaximumPriceChange(Number(event.target.value))
              }
            />
          </div>
          <div className="tour-filters__range-scale">
            <span>{PRICE_FILTER_MIN}</span>
            <span>{PRICE_FILTER_MAX}</span>
          </div>
          <div className="tour-filters__range-values">
            <div className="tour-filters__range-value">
              <span>From</span>
              <strong>${minimumPrice}</strong>
            </div>
            <span className="tour-filters__range-word">To</span>
            <div className="tour-filters__range-value">
              <strong>${maximumPrice}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="tour-filters__section tour-filters__section--guests">
        <h3>Guests</h3>
        <div className="tour-filters__stack">
          <div className="tour-filters__input">
            <input
              type="number"
              min={1}
              max={12}
              inputMode="numeric"
              placeholder="Enter guests count (1-12)"
              value={filter.getGuests() === 0 ? '' : filter.getGuests()}
              onChange={(event) => handleGuestsInput(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => setGuests(0)}
          >
            Clear Guests Filter
          </button>
        </div>
      </section>

      <section>
        <h3>Duration</h3>
        <div className="tour-filters__stack">
          {meta.durations.map((duration) => (
            <label key={duration}>
              <input
                type="checkbox"
                checked={selectedDurations.includes(duration)}
                onChange={() => toggleDuration(duration)}
              />
              {duration} Days
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Type of Tour</h3>
        <div className="tour-filters__transport-grid">
          {TRANSPORT_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              className={`tour-filters__transport-button ${selectedTransportModes.includes(value) ? 'is-active' : ''}`}
              onClick={() => setTransportMode(value)}
              aria-pressed={selectedTransportModes.includes(value)}
              title={label}
            >
              <Icon size={26} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Amenities</h3>
        <div className="tour-filters__stack">
          {meta.amenities.map((amenity) => (
            <label key={amenity}>
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() =>
                  toggleSelection(selectedAmenities, amenity, 'amenities')
                }
              />
              {amenity}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Top Reviews</h3>
        <div className="tour-filters__stack">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="tour-filters__rating-option">
              <input
                type="checkbox"
                checked={selectedReviewStars.includes(star)}
                onChange={() => toggleReviewStar(star)}
              />
              <span className="tour-filters__stars" aria-label={`${star} stars`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={`${star}-${index + 1}`}
                    className={index < star ? 'is-filled' : 'is-empty'}
                  >
                    {'\u2605'}
                  </span>
                ))}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Language</h3>
        <div className="tour-filters__stack">
          {meta.languages.map((language) => (
            <label key={language}>
              <input
                type="checkbox"
                checked={selectedLanguages.includes(language)}
                onChange={() =>
                  toggleSelection(selectedLanguages, language, 'languages')
                }
              />
              {language}
            </label>
          ))}
        </div>
      </section>
    </aside>
  );
};
