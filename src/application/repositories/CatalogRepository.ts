import { Tour, type TourPrimitives } from '../../domain/catalog/Tour';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export class CatalogRepository extends BrowserStorageRepository<Tour, TourPrimitives> {
  public constructor() {
    super('tourex.catalog');
  }

  protected deserialize(record: TourPrimitives): Tour {
    return Tour.restore(record);
  }

  public findById(id: string): Tour | undefined {
    return this.findOne((tour) => tour.getId() === id);
  }

  public findBySlug(slug: string): Tour | undefined {
    return this.findOne((tour) => tour.getSlug() === slug);
  }

  public saveTour(tour: Tour): void {
    this.saveOrReplace(tour, (current) => current.getId() === tour.getId());
  }

  public deleteTour(tourId: string): void {
    this.removeWhere((tour) => tour.getId() === tourId);
  }
}
