import { Booking, type BookingPrimitives } from '../booking/Booking';
import type { BookingRequest } from '../booking/BookingRequest';
import { CatalogItem, type CatalogItemPrimitives } from './CatalogItem';
import type {
  IBookable,
  IDiscountable,
  IFilterable,
  IReviewable,
  IWishlistable,
} from '../shared/contracts';
import { Review, type ReviewPrimitives } from '../reviews/Review';
import { Destination, type DestinationPrimitives } from './Destination';
import { createId } from '../../shared/utils/identity';
import type { TourKind, TourTransportMode } from '../../shared/types/domain';
import {
  FeaturedTourPricingStrategy,
  PremiumTourPricingStrategy,
  SeasonalTourPricingStrategy,
  StandardTourPricingStrategy,
  type TourPriceQuote,
  type TourPricingStrategy,
} from './TourPricing';
import { TourFilter } from './TourFilter';
import type { ValidationError } from '../shared/ValidationError';

export interface TourItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface TourPrimitives extends CatalogItemPrimitives {
  kind: TourKind;
  locationNote: string;
  durationDays: number;
  transportMode?: TourTransportMode;
  groupSize: number;
  typeLabel: string;
  languages: string[];
  amenities: string[];
  highlightItems: string[];
  includedItems: string[];
  excludedItems: string[];
  itinerary: TourItineraryItem[];
  reviews: ReviewPrimitives[];
  ribbonLabel: string | null;
  seasonName?: string;
  seasonMultiplier?: number;
  premiumMultiplier?: number;
}

interface TourProps {
  id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string;
  cardImage: string;
  gallery: string[];
  destination: Destination;
  basePrice: number;
  locationNote: string;
  durationDays: number;
  transportMode: TourTransportMode;
  groupSize: number;
  typeLabel: string;
  languages: string[];
  amenities: string[];
  highlightItems: string[];
  includedItems: string[];
  excludedItems: string[];
  itinerary: TourItineraryItem[];
  reviews: Review[];
  ribbonLabel: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tour
  extends CatalogItem<TourPrimitives>
  implements
    IBookable<BookingRequest, Booking>,
    IDiscountable,
    IReviewable<Review>,
    IWishlistable,
    IFilterable<TourFilter>
{
  protected readonly locationNote: string;
  protected readonly durationDays: number;
  protected readonly transportMode: TourTransportMode;
  protected readonly groupSize: number;
  protected readonly typeLabel: string;
  protected readonly languages: string[];
  protected readonly amenities: string[];
  protected readonly highlightItems: string[];
  protected readonly includedItems: string[];
  protected readonly excludedItems: string[];
  protected readonly itinerary: TourItineraryItem[];
  protected readonly reviews: Review[];
  protected readonly ribbonLabel: string | null;

  public constructor(props: TourProps) {
    super(
      props.id,
      props.title,
      props.slug,
      props.summary,
      props.heroImage,
      props.cardImage,
      props.gallery,
      props.destination,
      props.basePrice,
      props.createdAt,
      props.updatedAt,
    );

    this.locationNote = props.locationNote;
    this.durationDays = props.durationDays;
    this.transportMode = props.transportMode;
    this.groupSize = props.groupSize;
    this.typeLabel = props.typeLabel;
    this.languages = props.languages;
    this.amenities = props.amenities;
    this.highlightItems = props.highlightItems;
    this.includedItems = props.includedItems;
    this.excludedItems = props.excludedItems;
    this.itinerary = props.itinerary;
    this.reviews = props.reviews;
    this.ribbonLabel = props.ribbonLabel;
  }

  public getKind(): TourKind {
    return 'standard';
  }

  public getWishlistKey(): string {
    return this.id;
  }

  public getLocationNote(): string {
    return this.locationNote;
  }

  public getDurationDays(): number {
    return this.durationDays;
  }

  public getTransportMode(): TourTransportMode {
    return this.transportMode;
  }

  public getGroupSize(): number {
    return this.groupSize;
  }

  public getTypeLabel(): string {
    return this.typeLabel;
  }

  public getLanguages(): string[] {
    return [...this.languages];
  }

  public getAmenities(): string[] {
    return [...this.amenities];
  }

  public getHighlightItems(): string[] {
    return [...this.highlightItems];
  }

  public getIncludedItems(): string[] {
    return [...this.includedItems];
  }

  public getExcludedItems(): string[] {
    return [...this.excludedItems];
  }

  public getItinerary(): TourItineraryItem[] {
    return [...this.itinerary];
  }

  public getRibbonLabel(): string | null {
    return this.ribbonLabel;
  }

  public getDiscountedPrice(): number {
    return this.createPricingStrategy().getDiscountedUnitPrice(this);
  }

  public getDiscountLabel(): string | null {
    return this.createPricingStrategy().getDiscountLabel(this);
  }

  public getReviews(): Review[] {
    return [...this.reviews];
  }

  public addReview(review: Review): void {
    if (review.getTourId() === this.id) {
      this.reviews.unshift(review);
      this.touch();
    }
  }

  public getReviewCount(): number {
    return this.reviews.length;
  }

  public getAverageRating(): number {
    if (this.reviews.length === 0) {
      return 0;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + review.getAverageScore(),
      0,
    );

    return Number((total / this.reviews.length).toFixed(1));
  }

  public getReviewStarBucket(): 0 | 4 | 5 {
    const averageRating = this.getAverageRating();

    if (averageRating === 0) {
      return 0;
    }

    return averageRating > 4.5 ? 5 : 4;
  }

  public getScoreBreakdown(): Record<keyof Review['getScores'], number> {
    const fallback = {
      location: 4.8,
      amenities: 4.7,
      services: 4.9,
      price: 4.5,
      rooms: 4.8,
    };

    if (this.reviews.length === 0) {
      return fallback;
    }

    const summary = {
      location: 0,
      amenities: 0,
      services: 0,
      price: 0,
      rooms: 0,
    };

    this.reviews.forEach((review) => {
      const scores = review.getScores();
      summary.location += scores.location;
      summary.amenities += scores.amenities;
      summary.services += scores.services;
      summary.price += scores.price;
      summary.rooms += scores.rooms;
    });

    return {
      location: Number((summary.location / this.reviews.length).toFixed(1)),
      amenities: Number((summary.amenities / this.reviews.length).toFixed(1)),
      services: Number((summary.services / this.reviews.length).toFixed(1)),
      price: Number((summary.price / this.reviews.length).toFixed(1)),
      rooms: Number((summary.rooms / this.reviews.length).toFixed(1)),
    };
  }

  public validateBookingRequest(request: BookingRequest): ValidationError[] {
    const errors = [...request.validate()];

    if (request.getGuestCount() > this.groupSize) {
      errors.push({
        field: 'tickets',
        message: `This tour allows up to ${this.groupSize} travellers.`,
      });
    }

    return errors;
  }

  public canBeBooked(request: BookingRequest): boolean {
    return this.validateBookingRequest(request).length === 0;
  }

  public createBooking(userId: string, request: BookingRequest): Booking {
    if (!this.canBeBooked(request)) {
      throw new Error('Invalid booking request.');
    }

    const quote = this.quote(request);

    return new Booking(
      createId('booking'),
      userId,
      this.id,
      this.slug,
      this.title,
      this.getKind(),
      this.cardImage,
      this.destination.getLabel(),
      quote.discountedUnitPrice,
      quote.originalUnitPrice,
      this.getDiscountLabel(),
      quote.totalPrice,
      'draft',
      request,
    );
  }

  public quote(request: BookingRequest): TourPriceQuote {
    return this.createPricingStrategy().quote(this, request);
  }

  public matchesReviewStars(reviewStars: number[]): boolean {
    return reviewStars.length === 0 || reviewStars.includes(this.getReviewStarBucket());
  }

  public matches(criteria: TourFilter): boolean {
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
      this.title.toLowerCase().includes(query) ||
      this.destination.getLabel().toLowerCase().includes(query) ||
      this.summary.toLowerCase().includes(query);

    const destinationMatches =
      destinations.length === 0 || destinations.includes(this.destination.getId());

    const durationMatches =
      durations.length === 0 || durations.includes(this.durationDays);

    const transportMatches =
      transportModes.length === 0 || transportModes.includes(this.transportMode);

    const amenitiesMatch =
      amenities.length === 0 ||
      amenities.every((amenity) => this.amenities.includes(amenity));

    const languageMatch =
      languages.length === 0 ||
      languages.some((language) => this.languages.includes(language));

    const ratingMatch = this.matchesReviewStars(reviewStars);
    const price = this.getDiscountedPrice();
    const priceMatch = price >= minimumPrice && price <= maximumPrice;
    const guestsMatch = guests === 0 || this.groupSize === guests;

    return (
      queryMatches &&
      destinationMatches &&
      durationMatches &&
      transportMatches &&
      amenitiesMatch &&
      languageMatch &&
      ratingMatch &&
      priceMatch &&
      guestsMatch
    );
  }

  public override validate(): ValidationError[] {
    const errors = super.validate();

    if (this.durationDays <= 0) {
      errors.push({
        field: 'durationDays',
        message: 'Tour duration must be greater than zero.',
      });
    }

    if (this.groupSize <= 0) {
      errors.push({
        field: 'groupSize',
        message: 'Group size must be greater than zero.',
      });
    }

    return errors;
  }

  protected createPricingStrategy(): TourPricingStrategy {
    return new StandardTourPricingStrategy();
  }

  protected toBasePrimitives(): Omit<
    TourPrimitives,
    'kind' | 'seasonName' | 'seasonMultiplier' | 'premiumMultiplier'
  > {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      summary: this.summary,
      heroImage: this.heroImage,
      cardImage: this.cardImage,
      gallery: this.getGallery(),
      destination: this.destination.toPrimitives(),
      basePrice: this.basePrice,
      locationNote: this.locationNote,
      durationDays: this.durationDays,
      transportMode: this.transportMode,
      groupSize: this.groupSize,
      typeLabel: this.typeLabel,
      languages: this.getLanguages(),
      amenities: this.getAmenities(),
      highlightItems: this.getHighlightItems(),
      includedItems: this.getIncludedItems(),
      excludedItems: this.getExcludedItems(),
      itinerary: this.getItinerary(),
      reviews: this.reviews.map((review) => review.toPrimitives()),
      ribbonLabel: this.ribbonLabel,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public override toPrimitives(): TourPrimitives {
    return {
      ...this.toBasePrimitives(),
      kind: 'standard',
    };
  }

  public static restore(primitives: TourPrimitives): Tour {
    const destination = Destination.restore(primitives.destination);
    const reviews = primitives.reviews.map((review) => Review.restore(review));

    const baseProps = {
      id: primitives.id,
      title: primitives.title,
      slug: primitives.slug,
      summary: primitives.summary,
      heroImage: primitives.heroImage,
      cardImage: primitives.cardImage,
      gallery: primitives.gallery,
      destination,
      basePrice: primitives.basePrice,
      locationNote: primitives.locationNote,
      durationDays: primitives.durationDays,
      transportMode: primitives.transportMode ?? 'flightIncluded',
      groupSize: primitives.groupSize,
      typeLabel: primitives.typeLabel,
      languages: primitives.languages,
      amenities: primitives.amenities,
      highlightItems: primitives.highlightItems,
      includedItems: primitives.includedItems,
      excludedItems: primitives.excludedItems,
      itinerary: primitives.itinerary,
      reviews,
      ribbonLabel: primitives.ribbonLabel,
      createdAt: new Date(primitives.createdAt),
      updatedAt: new Date(primitives.updatedAt),
    };

    switch (primitives.kind) {
      case 'featured':
        return new FeaturedTour(baseProps);
      case 'seasonal':
        return new SeasonalTour(
          baseProps,
          primitives.seasonName ?? 'Holiday',
          primitives.seasonMultiplier ?? 0.84,
        );
      case 'premium':
        return new PremiumTour(baseProps, primitives.premiumMultiplier ?? 1.18);
      default:
        return new Tour(baseProps);
    }
  }
}

export class FeaturedTour extends Tour {
  public override getKind(): TourKind {
    return 'featured';
  }

  public override getDiscountLabel(): string | null {
    return 'Featured special';
  }

  protected override createPricingStrategy(): TourPricingStrategy {
    return new FeaturedTourPricingStrategy();
  }

  public override toPrimitives(): TourPrimitives {
    return {
      ...this.toBasePrimitives(),
      kind: 'featured',
    };
  }
}

export class SeasonalTour extends Tour {
  public constructor(
    props: TourProps,
    private readonly seasonName: string,
    private readonly seasonMultiplier: number,
  ) {
    super({
      ...props,
      ribbonLabel: props.ribbonLabel ?? seasonName,
    });
  }

  public override getKind(): TourKind {
    return 'seasonal';
  }

  public getSeasonName(): string {
    return this.seasonName;
  }

  public override getDiscountLabel(): string | null {
    return `${this.seasonName} offer`;
  }

  protected override createPricingStrategy(): TourPricingStrategy {
    return new SeasonalTourPricingStrategy(this.seasonMultiplier);
  }

  public override toPrimitives(): TourPrimitives {
    return {
      ...this.toBasePrimitives(),
      kind: 'seasonal',
      seasonName: this.seasonName,
      seasonMultiplier: this.seasonMultiplier,
    };
  }
}

export class PremiumTour extends Tour {
  public constructor(props: TourProps, private readonly premiumMultiplier: number) {
    super({
      ...props,
      ribbonLabel: props.ribbonLabel ?? 'Private',
    });
  }

  public override getKind(): TourKind {
    return 'premium';
  }

  public override getDiscountLabel(): string | null {
    return 'Private concierge';
  }

  protected override createPricingStrategy(): TourPricingStrategy {
    return new PremiumTourPricingStrategy(this.premiumMultiplier);
  }

  public override toPrimitives(): TourPrimitives {
    return {
      ...this.toBasePrimitives(),
      kind: 'premium',
      premiumMultiplier: this.premiumMultiplier,
    };
  }
}

export type TourCatalogPrimitives = TourPrimitives | BookingPrimitives | DestinationPrimitives;
