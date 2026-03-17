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

  public deleteToursByTitle(titles: string[]): void {
    if (titles.length === 0) {
      return;
    }

    const deniedTitles = new Set(titles.map((title) => title.trim().toLowerCase()));
    const currentCatalog = this.getAll();
    const filteredCatalog = currentCatalog.filter(
      (tour) => !deniedTitles.has(tour.getTitle().trim().toLowerCase()),
    );

    if (filteredCatalog.length !== currentCatalog.length) {
      this.saveAll(filteredCatalog);
    }
  }

  public syncSeedCatalog(seedTours: Tour[]): void {
    const currentCatalog = this.getAll();

    if (currentCatalog.length === 0) {
      return;
    }

    const currentIds = new Set(currentCatalog.map((tour) => tour.getId()));
    const missingSeedTours = seedTours.filter((tour) => !currentIds.has(tour.getId()));

    if (missingSeedTours.length === 0) {
      return;
    }

    this.saveAll([...currentCatalog, ...missingSeedTours]);
  }

  public syncSeedGroupSizes(seedTours: Tour[]): void {
    const currentCatalog = this.getAll();

    if (currentCatalog.length === 0) {
      return;
    }

    const seedGroupSizeMap = new Map(
      seedTours.map((tour) => [tour.getId(), tour.getGroupSize()]),
    );

    let hasChanges = false;

    const normalizedCatalog = currentCatalog.map((tour) => {
      const expectedGroupSize = seedGroupSizeMap.get(tour.getId());

      if (
        expectedGroupSize === undefined ||
        tour.getGroupSize() === expectedGroupSize
      ) {
        return tour;
      }

      const primitives = tour.toPrimitives();
      hasChanges = true;

      return Tour.restore({
        ...primitives,
        groupSize: expectedGroupSize,
      });
    });

    if (hasChanges) {
      this.saveAll(normalizedCatalog);
    }
  }

  public syncSeedReviews(seedTours: Tour[]): void {
    const currentCatalog = this.getAll();

    if (currentCatalog.length === 0) {
      return;
    }

    const seedReviewMap = new Map(
      seedTours.map((tour) => [tour.getId(), tour.toPrimitives().reviews]),
    );

    let hasChanges = false;

    const normalizedCatalog = currentCatalog.map((tour) => {
      const seedReviews = seedReviewMap.get(tour.getId());

      if (!seedReviews) {
        return tour;
      }

      const primitives = tour.toPrimitives();
      const userReviews = primitives.reviews.filter(
        (review) => !review.id.startsWith(`review-${tour.getId()}-`),
      );
      const mergedReviews = [...seedReviews, ...userReviews];

      const unchangedSeedReviews =
        seedReviews.length === primitives.reviews.length - userReviews.length &&
        seedReviews.every(
          (review, index) =>
            JSON.stringify(review) === JSON.stringify(primitives.reviews[index]),
        );

      if (unchangedSeedReviews && mergedReviews.length === primitives.reviews.length) {
        const unchangedUserReviews = userReviews.every(
          (review, index) =>
            review.id === primitives.reviews[seedReviews.length + index]?.id,
        );

        if (unchangedUserReviews) {
          return tour;
        }
      }

      hasChanges = true;

      return Tour.restore({
        ...primitives,
        reviews: mergedReviews,
      });
    });

    if (hasChanges) {
      this.saveAll(normalizedCatalog);
    }
  }

  public syncSeedFacets(seedTours: Tour[]): void {
    const currentCatalog = this.getAll();

    if (currentCatalog.length === 0) {
      return;
    }

    const seedFacetMap = new Map(
      seedTours.map((tour) => [
        tour.getId(),
        {
          amenities: tour.getAmenities(),
          languages: tour.getLanguages(),
          transportMode: tour.getTransportMode(),
        },
      ]),
    );

    let hasChanges = false;

    const normalizedCatalog = currentCatalog.map((tour) => {
      const expectedFacets = seedFacetMap.get(tour.getId());

      if (!expectedFacets) {
        return tour;
      }

      const primitives = tour.toPrimitives();
      const sameAmenities =
        JSON.stringify(primitives.amenities) ===
        JSON.stringify(expectedFacets.amenities);
      const sameLanguages =
        JSON.stringify(primitives.languages) ===
        JSON.stringify(expectedFacets.languages);
      const sameTransportMode =
        primitives.transportMode === expectedFacets.transportMode;

      if (sameAmenities && sameLanguages && sameTransportMode) {
        return tour;
      }

      hasChanges = true;

      return Tour.restore({
        ...primitives,
        amenities: expectedFacets.amenities,
        languages: expectedFacets.languages,
        transportMode: expectedFacets.transportMode,
      });
    });

    if (hasChanges) {
      this.saveAll(normalizedCatalog);
    }
  }
}
