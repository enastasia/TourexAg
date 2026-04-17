import { BookingRepository } from '../application/repositories/BookingRepository';
import { CartRepository } from '../application/repositories/CartRepository';
import { CatalogRepository } from '../application/repositories/CatalogRepository';
import { PricingPlanRepository } from '../application/repositories/PricingPlanRepository';
import { UserRepository } from '../application/repositories/UserRepository';
import { Tour } from '../domain/catalog/Tour';
import { createSeedBookings } from './data/seedBookings';
import { createSeedCarts } from './data/seedCarts';
import { createSeedPricingPlans } from './data/seedPricingPlans';
import { createSeedTours } from './data/seedCatalog';
import { createSeedUsers } from './data/seedUsers';

const OBSOLETE_SEED_TOUR_TITLES = ['авмвы'];

export class DatabaseSeeder {
  public constructor(
    private readonly catalog: CatalogRepository,
    private readonly users: UserRepository,
    private readonly bookings: BookingRepository,
    private readonly carts: CartRepository,
    private readonly pricingPlans: PricingPlanRepository,
  ) {}

  public seed(): void {
    const seedTours = createSeedTours();

    this.catalog.seed(seedTours);
    this.deleteObsoleteSeedToursByTitle(OBSOLETE_SEED_TOUR_TITLES);
    this.syncSeedCatalog(seedTours);
    this.syncSeedGroupSizes(seedTours);
    this.syncSeedReviews(seedTours);
    this.syncSeedFacets(seedTours);

    this.users.seed(createSeedUsers());
    this.carts.seed(createSeedCarts());
    this.migrateEmbeddedUserCarts();

    this.bookings.seed(createSeedBookings(seedTours));
    this.pricingPlans.seed(createSeedPricingPlans());
  }

  private migrateEmbeddedUserCarts(): void {
    this.users.getLegacyCarts().forEach((cart) => {
      if (this.carts.findByUserId(cart.getOwnerId())) {
        return;
      }

      this.carts.saveCart(cart);
    });
  }

  private deleteObsoleteSeedToursByTitle(titles: string[]): void {
    if (titles.length === 0) {
      return;
    }

    const deniedTitles = new Set(titles.map((title) => title.trim().toLowerCase()));
    const currentCatalog = this.catalog.getAll();
    const filteredCatalog = currentCatalog.filter(
      (tour) => !deniedTitles.has(tour.getTitle().trim().toLowerCase()),
    );

    if (filteredCatalog.length !== currentCatalog.length) {
      this.catalog.saveAll(filteredCatalog);
    }
  }

  private syncSeedCatalog(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();

    if (currentCatalog.length === 0) {
      return;
    }

    const currentIds = new Set(currentCatalog.map((tour) => tour.getId()));
    const missingSeedTours = seedTours.filter((tour) => !currentIds.has(tour.getId()));

    if (missingSeedTours.length > 0) {
      this.catalog.saveAll([...currentCatalog, ...missingSeedTours]);
    }
  }

  private syncSeedGroupSizes(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();

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

      hasChanges = true;

      return Tour.restore({
        ...tour.toPrimitives(),
        groupSize: expectedGroupSize,
      });
    });

    if (hasChanges) {
      this.catalog.saveAll(normalizedCatalog);
    }
  }

  private syncSeedReviews(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();

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
      this.catalog.saveAll(normalizedCatalog);
    }
  }

  private syncSeedFacets(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();

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
      const sameTransportMode = primitives.transportMode === expectedFacets.transportMode;

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
      this.catalog.saveAll(normalizedCatalog);
    }
  }
}
