import type { Tour } from '../../domain/catalog/Tour';
import type { TourFilter } from '../../domain/catalog/TourFilter';

export class TourMatcher {
  public matches(tour: Tour, criteria: TourFilter): boolean {
    const query = criteria.getQuery().trim().toLowerCase();
    const destinations = criteria.getDestinations();
    const durations = criteria.getDurations();
    const transportModes = criteria.getTransportModes();
    const amenities = criteria.getAmenities();
    const languages = criteria.getLanguages();
    const reviewStars = criteria.getReviewStars();
    const guests = criteria.getGuests();
    const [minimumPrice, maximumPrice] = criteria.getPriceRange();

    const queryMatches =
      query.length === 0 ||
      tour.getTitle().toLowerCase().includes(query) ||
      tour.getDestination().getLabel().toLowerCase().includes(query) ||
      tour.getSummary().toLowerCase().includes(query);

    const destinationMatches =
      destinations.length === 0 || destinations.includes(tour.getDestination().getId());

    const durationMatches =
      durations.length === 0 || durations.includes(tour.getDurationDays());

    const transportMatches =
      transportModes.length === 0 || transportModes.includes(tour.getTransportMode());

    const amenitiesMatch =
      amenities.length === 0 ||
      amenities.every((amenity) => tour.getAmenities().includes(amenity));

    const languageMatch =
      languages.length === 0 ||
      languages.some((language) => tour.getLanguages().includes(language));

    const price = tour.getDiscountedPrice();
    const priceMatch = price >= minimumPrice && price <= maximumPrice;
    const guestsMatch = guests === 0 || tour.getGroupSize() === guests;

    return (
      queryMatches &&
      destinationMatches &&
      durationMatches &&
      transportMatches &&
      amenitiesMatch &&
      languageMatch &&
      this.matchesReviewStars(tour, reviewStars) &&
      priceMatch &&
      guestsMatch
    );
  }

  private matchesReviewStars(tour: Tour, reviewStars: number[]): boolean {
    return reviewStars.length === 0 || reviewStars.includes(tour.getReviewStarBucket());
  }
}
