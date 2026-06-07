import type { Tour } from '../../domain/catalog/Tour';

export interface ICatalogRepository {
  getAll(): Tour[];
  findById(tourId: string): Tour | undefined;
  findBySlug(slug: string): Tour | undefined;
  saveTour(tour: Tour): void;
  deleteTour(tourId: string): void;
  saveAll(entities: Tour[]): void;
}
