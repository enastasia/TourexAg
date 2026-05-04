import {
  Clock3,
  Heart,
  MapPin,
  Users,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../../domain/people/User';
import { formatCurrency } from '../../../shared/utils/formatters';
import { RatingStars } from '../common/RatingStars';
import { useAppStore } from '../../hooks/useAppStore';

interface TourCardProps {
  tour: {
    getId(): string;
    getSlug(): string;
    getTitle(): string;
    getCardImage(): string;
    getRibbonLabel(): string | null;
    getDestinationLabel(): string;
    getDurationDays(): number;
    getGroupSize(): number;
    getDiscountedPrice(): number;
    getBasePrice(): number;
    getSummary(): string;
    getReviewCount(): number;
    getReviewStarBucket(): number;
  };
  imageOverride?: string;
  showSummary?: boolean;
}

export const TourCard = ({ tour, imageOverride, showSummary = false }: TourCardProps) => {
  const {
    state: { currentPerson },
    store,
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const tourHref = `/tours/${tour.getSlug()}`;
  const cardImage = imageOverride ?? tour.getCardImage();

  const wishlisted =
    currentPerson instanceof User && currentPerson.hasWishlistedTour(tour.getId());

  const handleWishlist = () => {
    const result = store.toggleWishlist(tour.getId());

    if (!result.success && !currentPerson) {
      navigate('/login', {
        state: {
          from: location,
        },
      });
    }
  };

  const handleOpenTour = () => {
    navigate(tourHref);
  };

  return (
    <article
      className="tour-card tour-card--interactive"
      onClick={handleOpenTour}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenTour();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${tour.getTitle()}`}
    >
      <div className="tour-card__media">
        {tour.getRibbonLabel() ? (
          <span className="tour-card__badge">{tour.getRibbonLabel()}</span>
        ) : null}
        <img src={cardImage} alt={tour.getTitle()} />
        <button
          type="button"
          className={`tour-card__favorite ${wishlisted ? 'is-active' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            handleWishlist();
          }}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="tour-card__body">
        <h3>{tour.getTitle()}</h3>
        <div className="tour-card__meta">
          <span>
            <MapPin size={14} />
            {tour.getDestinationLabel()}
          </span>
          <span>
            <Clock3 size={14} />
            {tour.getDurationDays()} Days
          </span>
          <span>
            <Users size={14} />
            {tour.getGroupSize()} Guests
          </span>
        </div>

        {showSummary ? <p className="tour-card__summary">{tour.getSummary()}</p> : null}

        <div className="tour-card__footer">
          <div className="tour-card__price">
            {tour.getBasePrice() > tour.getDiscountedPrice() ? (
              <span className="tour-card__price-old">
                {formatCurrency(tour.getBasePrice())}
              </span>
            ) : (
              <span
                className="tour-card__price-old tour-card__price-old--placeholder"
                aria-hidden="true"
              >
                {formatCurrency(tour.getDiscountedPrice())}
              </span>
            )}
            <div className="tour-card__price-current">
              <strong>{formatCurrency(tour.getDiscountedPrice())}</strong>
              <small>/Person</small>
            </div>
          </div>

          <div className="tour-card__rating">
            <RatingStars value={tour.getReviewStarBucket()} size={13} />
            <small>({tour.getReviewCount()} Reviews)</small>
          </div>
        </div>
      </div>
    </article>
  );
};
