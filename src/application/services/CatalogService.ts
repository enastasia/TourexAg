import type { Review } from '../../domain/reviews/Review';
import { Tour } from '../../domain/catalog/Tour';
import { TourFilter } from '../../domain/catalog/TourFilter';
import { CatalogRepository } from '../repositories/CatalogRepository';
import { TourMatcher } from './TourMatcher';

export interface CatalogPage {
  items: Tour[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface DestinationSummary {
  id: string;
  label: string;
  image: string;
  toursCount: number;
}

export interface CatalogMeta {
  destinations: Array<{
    id: string;
    label: string;
  }>;
  amenities: string[];
  durations: number[];
  languages: string[];
  maxPrice: number;
}

export class CatalogService {
  public constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly tourMatcher: TourMatcher,
  ) {}

  public getAllTours(): Tour[] {
    return this.catalogRepository.getAll();
  }

  public getBySlug(slug: string): Tour | undefined {
    return this.catalogRepository.findBySlug(slug);
  }

  public getCatalogPage(filter: TourFilter, sourceTours?: Tour[]): CatalogPage {
    const filtered = this.sortTours(
      this.getTours(sourceTours).filter((tour) => this.tourMatcher.matches(tour, filter)),
      filter,
    );
    const pageSize = filter.getPageSize();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(Math.max(1, filter.getPage()), totalPages);
    const startIndex = (page - 1) * pageSize;

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      totalItems: filtered.length,
      totalPages,
      currentPage: page,
    };
  }

  public getFeaturedTours(limit: number, sourceTours?: Tour[]): Tour[] {
    return this.getTours(sourceTours)
      .filter((tour) => tour.getKind() !== 'standard')
      .slice(0, limit);
  }

  public getPopularTours(limit: number, sourceTours?: Tour[]): Tour[] {
    return [...this.getTours(sourceTours)]
      .sort((left, right) => right.getAverageRating() - left.getAverageRating())
      .slice(0, limit);
  }

  public getTopDestinations(limit: number, sourceTours?: Tour[]): DestinationSummary[] {
    const destinationMap = new Map<string, DestinationSummary>();

    this.getTours(sourceTours).forEach((tour) => {
      const destination = tour.getDestination();
      const current = destinationMap.get(destination.getId());

      if (current) {
        current.toursCount += 1;
        return;
      }

      destinationMap.set(destination.getId(), {
        id: destination.getId(),
        label: destination.getCity(),
        image: destination.getImage(),
        toursCount: 1,
      });
    });

    return [...destinationMap.values()]
      .sort((left, right) => right.toursCount - left.toursCount)
      .slice(0, limit);
  }

  public getTestimonials(limit: number, sourceTours?: Tour[]): Review[] {
    return this.getTours(sourceTours)
      .flatMap((tour) => tour.getReviews())
      .sort(
        (left, right) =>
          right.getCreatedAt().getTime() - left.getCreatedAt().getTime(),
      )
      .slice(0, limit);
  }

  public getMeta(sourceTours?: Tour[]): CatalogMeta {
    const tours = this.getTours(sourceTours);
    const destinationsMap = new Map<string, { id: string; label: string }>();

    tours.forEach((tour) => {
      const destination = tour.getDestination();
      destinationsMap.set(destination.getId(), {
        id: destination.getId(),
        label: destination.getCity(),
      });
    });

    return {
      destinations: [...destinationsMap.values()],
      amenities: [...new Set(tours.flatMap((tour) => tour.getAmenities()))],
      durations: [...new Set(tours.map((tour) => tour.getDurationDays()))].sort(
        (left, right) => left - right,
      ),
      languages: [...new Set(tours.flatMap((tour) => tour.getLanguages()))],
      maxPrice:
        tours.length > 0
          ? Math.max(...tours.map((tour) => tour.getDiscountedPrice()))
          : 1000,
    };
  }

  public saveTour(tour: Tour): void {
    this.catalogRepository.saveTour(tour);
  }

  public deleteTour(tourId: string): void {
    this.catalogRepository.deleteTour(tourId);
  }

  private getTours(sourceTours?: Tour[]): Tour[] {
    return sourceTours ?? this.catalogRepository.getAll();
  }

  private sortTours(tours: Tour[], filter: TourFilter): Tour[] {
    const sorted = [...tours];

    switch (filter.getSortBy()) {
      case 'priceAsc':
        sorted.sort(
          (left, right) => left.getDiscountedPrice() - right.getDiscountedPrice(),
        );
        break;
      case 'priceDesc':
        sorted.sort(
          (left, right) => right.getDiscountedPrice() - left.getDiscountedPrice(),
        );
        break;
      case 'ratingDesc':
        sorted.sort((left, right) => right.getAverageRating() - left.getAverageRating());
        break;
      case 'durationAsc':
        sorted.sort((left, right) => left.getDurationDays() - right.getDurationDays());
        break;
      default:
        sorted.sort(
          (left, right) =>
            right.getCreatedAt().getTime() - left.getCreatedAt().getTime(),
        );
        break;
    }

    return sorted;
  }
}
