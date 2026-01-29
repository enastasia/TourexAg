import type { ISerializable } from '../shared/contracts';
import type { TourSortMode, TourTransportMode } from '../../shared/types/domain';

export interface TourFilterPrimitives {
  query: string;
  destinations: string[];
  priceRange: [number, number];
  durations: number[];
  transportModes: TourTransportMode[];
  amenities: string[];
  minimumRating: number;
  reviewStars: number[];
  languages: string[];
  sortBy: TourSortMode;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  page: number;
  pageSize: number;
}

export class TourFilter implements ISerializable<TourFilterPrimitives> {
  public constructor(private readonly state: TourFilterPrimitives) {}

  private static readonly DEFAULT_PRICE_RANGE: [number, number] = [100, 900];
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 1000;

  public static createDefault(): TourFilter {
    return new TourFilter({
      query: '',
      destinations: [],
      priceRange: [...TourFilter.DEFAULT_PRICE_RANGE],
      durations: [],
      transportModes: [],
      amenities: [],
      minimumRating: 0,
      reviewStars: [],
      languages: [],
      sortBy: 'default',
      checkInDate: '',
      checkOutDate: '',
      guests: 0,
      page: 1,
      pageSize: 12,
    });
  }

  public getQuery(): string {
    return this.state.query;
  }

  public getDestinations(): string[] {
    return [...this.state.destinations];
  }

  public getPriceRange(): [number, number] {
    return [...this.state.priceRange] as [number, number];
  }

  public getDurations(): number[] {
    return [...this.state.durations];
  }

  public getTransportModes(): TourTransportMode[] {
    return [...this.state.transportModes];
  }

  public getAmenities(): string[] {
    return [...this.state.amenities];
  }

  public getMinimumRating(): number {
    return this.state.minimumRating;
  }

  public getReviewStars(): number[] {
    return [...this.state.reviewStars];
  }

  public getLanguages(): string[] {
    return [...this.state.languages];
  }

  public getSortBy(): TourSortMode {
    return this.state.sortBy;
  }

  public getCheckInDate(): string {
    return this.state.checkInDate;
  }

  public getCheckOutDate(): string {
    return this.state.checkOutDate;
  }

  public getGuests(): number {
    return this.state.guests;
  }

  public getPage(): number {
    return this.state.page;
  }

  public getPageSize(): number {
    return this.state.pageSize;
  }

  public withChanges(
    changes: Partial<TourFilterPrimitives>,
    resetPage = false,
  ): TourFilter {
    return new TourFilter({
      ...this.state,
      ...changes,
      page: resetPage ? 1 : (changes.page ?? this.state.page),
    });
  }

  public toPrimitives(): TourFilterPrimitives {
    return {
      query: this.state.query,
      destinations: this.getDestinations(),
      priceRange: this.getPriceRange(),
      durations: this.getDurations(),
      transportModes: this.getTransportModes(),
      amenities: this.getAmenities(),
      minimumRating: this.state.minimumRating,
      reviewStars: this.getReviewStars(),
      languages: this.getLanguages(),
      sortBy: this.state.sortBy,
      checkInDate: this.state.checkInDate,
      checkOutDate: this.state.checkOutDate,
      guests: this.state.guests,
      page: this.state.page,
      pageSize: this.state.pageSize,
    };
  }

  public static restore(primitives: TourFilterPrimitives): TourFilter {
    const rawPriceRange = primitives.priceRange ?? TourFilter.DEFAULT_PRICE_RANGE;
    const normalizedMinimumPrice = Math.max(
      TourFilter.MIN_PRICE,
      Math.min(TourFilter.MAX_PRICE, rawPriceRange[0] ?? TourFilter.DEFAULT_PRICE_RANGE[0]),
    );
    const normalizedMaximumPrice = Math.max(
      normalizedMinimumPrice,
      Math.min(TourFilter.MAX_PRICE, rawPriceRange[1] ?? TourFilter.DEFAULT_PRICE_RANGE[1]),
    );

    return new TourFilter({
      ...primitives,
      transportModes: primitives.transportModes ?? [],
      priceRange: [normalizedMinimumPrice, normalizedMaximumPrice],
      minimumRating: primitives.minimumRating ?? 0,
      reviewStars: primitives.reviewStars ?? [],
    });
  }
}
