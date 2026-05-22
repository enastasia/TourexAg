import type { Review } from '../../domain/reviews/Review';
import { Tour } from '../../domain/catalog/Tour';
import { TourFilter } from '../../domain/catalog/TourFilter';
import { CatalogRepository } from '../repositories/CatalogRepository';

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
  public constructor(private readonly catalogRepository: CatalogRepository) {}

  public getAllTours(): Tour[] {
    return this.catalogRepository.getAll();
  }

  public getBySlug(slug: string): Tour | undefined {
    return this.catalogRepository.findBySlug(slug);
  }

  public getCatalogPage(filter: TourFilter): CatalogPage {
    const filtered = this.sortTours(
      this.catalogRepository.getAll().filter((tour) => tour.matches(filter)),
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

  public getFeaturedTours(limit: number): Tour[] {
    return this.catalogRepository
      .getAll()
      .filter((tour) => tour.getKind() !== 'standard')
      .slice(0, limit);
  }

  public getPopularTours(limit: number): Tour[] {
    return [...this.catalogRepository.getAll()]
      .sort((left, right) => right.getAverageRating() - left.getAverageRating())
      .slice(0, limit);
  }

  public getTopDestinations(limit: number): DestinationSummary[] {
    const destinationMap = new Map<string, DestinationSummary>();

    this.catalogRepository.getAll().forEach((tour) => {
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

  public getTestimonials(limit: number): Review[] {
    return this.catalogRepository
      .getAll()
      .flatMap((tour) => tour.getReviews())
      .sort(
        (left, right) =>
          right.getCreatedAt().getTime() - left.getCreatedAt().getTime(),
      )
      .slice(0, limit);
  }

  public getMeta(): CatalogMeta {
    const tours = this.catalogRepository.getAll();
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
