import { Tour, type TourPrimitives } from '../../domain/catalog/Tour';
import { BrowserStorageRepository } from './BrowserStorageRepository';
import type { ICatalogRepository } from './ICatalogRepository';

export class CatalogRepository extends BrowserStorageRepository<Tour, TourPrimitives> implements ICatalogRepository {
  public constructor() {
    super('tourex.catalog');
  }

  public findById(tourId: string): Tour | undefined {
    return this.getAll().find((tour) => tour.getId() === tourId);
  }

  public findBySlug(slug: string): Tour | undefined {
    return this.getAll().find((tour) => tour.getSlug() === slug);
  }

  public saveTour(nextTour: Tour): void {
    const tours = this.getAll();
    const index = tours.findIndex((tour) => tour.getId() === nextTour.getId());

    if (index >= 0) {
      tours.splice(index, 1, nextTour);
    } else {
      tours.unshift(nextTour);
    }

    this.saveAll(tours);
  }

  public deleteTour(tourId: string): void {
    this.saveAll(this.getAll().filter((tour) => tour.getId() !== tourId));
  }

  public deleteToursByTitle(titles: string[]): void {
    if (titles.length === 0) {
      return;
    }

    const titleSet = new Set(titles);
    this.saveAll(this.getAll().filter((tour) => !titleSet.has(tour.getTitle())));
  }

  public syncSeedCatalog(seedTours: Tour[]): void {
    const currentTours = this.getAll();
    const customTours = currentTours.filter(
      (tour) => !seedTours.some((seedTour) => seedTour.getId() === tour.getId()),
    );

    this.saveAll([...seedTours, ...customTours]);
  }

  public syncSeedGroupSizes(seedTours: Tour[]): void {
    this.syncSeedCatalog(seedTours);
  }

  public syncSeedFacets(seedTours: Tour[]): void {
    this.syncSeedCatalog(seedTours);
  }

  public syncSeedReviews(seedTours: Tour[]): void {
    this.syncSeedCatalog(seedTours);
  }

  protected deserialize(record: TourPrimitives): Tour {
    return Tour.restore(record);
  }
}
