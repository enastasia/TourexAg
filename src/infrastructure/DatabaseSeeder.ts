import { BookingRepository } from '../application/repositories/BookingRepository';
import { CartRepository } from '../application/repositories/CartRepository';
import { CatalogRepository } from '../application/repositories/CatalogRepository';
import { PricingPlanRepository } from '../application/repositories/PricingPlanRepository';
import { UserRepository, type StoredPerson } from '../application/repositories/UserRepository';
import { Admin } from '../domain/people/Admin';
import { Tour } from '../domain/catalog/Tour';
import { User } from '../domain/people/User';
import { createSeedBookings } from './data/seedBookings';
import { createSeedCarts } from './data/seedCarts';
import { createSeedPricingPlans } from './data/seedPricingPlans';
import { createSeedTours } from './data/seedCatalog';
import { createSeedUsers } from './data/seedUsers';

/**
 * Bump this number whenever seed data changes and existing localStorage
 * must be migrated. Sync/migration methods only run when the stored
 * version is older than SEED_VERSION, so user edits made through the
 * admin panel are never overwritten on a normal page reload.
 */
const SEED_VERSION = 7;
const SEED_VERSION_KEY = 'tourex.seedVersion';

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
    const storedVersion = this.getStoredVersion();
    const needsMigration = storedVersion < SEED_VERSION;

    this.catalog.seed(seedTours);
    this.deleteObsoleteSeedToursByTitle(OBSOLETE_SEED_TOUR_TITLES);
    this.syncSeedCatalog(seedTours);

    if (needsMigration) {
      this.syncSeedGroupSizes(seedTours);
      this.syncSeedReviews(seedTours);
      this.syncSeedFacets(seedTours);
      this.syncSeedGallery(seedTours);
      this.syncSeedImages(seedTours);
    }

    this.users.seed(createSeedUsers());
    this.syncSeedCredentials(createSeedUsers());
    this.carts.seed(createSeedCarts());
    this.migrateEmbeddedUserCarts();

    this.bookings.seed(createSeedBookings(seedTours));
    this.pricingPlans.seed(createSeedPricingPlans());

    if (needsMigration) {
      this.setStoredVersion(SEED_VERSION);
    }
  }

  private getStoredVersion(): number {
    if (typeof window === 'undefined') return SEED_VERSION;
    const raw = window.localStorage.getItem(SEED_VERSION_KEY);
    return raw ? Number(raw) : 0;
  }

  private setStoredVersion(version: number): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SEED_VERSION_KEY, String(version));
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

  private syncSeedCredentials(seedUsers: StoredPerson[]): void {
    for (const seedUser of seedUsers) {
      const current = this.users.findById(seedUser.getId());
      if (!current) continue;

      const emailChanged = current.getEmail() !== seedUser.getEmail();
      const passwordChanged = !current.matchesPasswordHash(
        seedUser.toPrimitives().passwordHash,
      );

      if (!emailChanged && !passwordChanged) continue;

      const primitives = current.toPrimitives();
      const updatedPrimitives = {
        ...primitives,
        email: seedUser.getEmail(),
        passwordHash: seedUser.toPrimitives().passwordHash,
      };

      const restored =
        current instanceof Admin
          ? Admin.restore(updatedPrimitives as import('../domain/people/Admin').AdminPrimitives)
          : User.restore(updatedPrimitives as import('../domain/people/User').UserPrimitives);

      this.users.savePerson(restored);
    }
  }

  private syncSeedGallery(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();
    if (currentCatalog.length === 0) return;

    const seedGalleryMap = new Map(
      seedTours.map((tour) => [tour.getId(), tour.getGallery()]),
    );
    let hasChanges = false;

    const normalizedCatalog = currentCatalog.map((tour) => {
      const expectedGallery = seedGalleryMap.get(tour.getId());
      if (!expectedGallery) return tour;

      const currentGallery = tour.getGallery();
      if (JSON.stringify(currentGallery) === JSON.stringify(expectedGallery)) return tour;

      hasChanges = true;
      return Tour.restore({ ...tour.toPrimitives(), gallery: expectedGallery });
    });

    if (hasChanges) this.catalog.saveAll(normalizedCatalog);
  }

  private syncSeedImages(seedTours: Tour[]): void {
    const currentCatalog = this.catalog.getAll();
    if (currentCatalog.length === 0) return;

    const seedImageMap = new Map(
      seedTours.map((tour) => {
        const p = tour.toPrimitives();
        return [tour.getId(), { cardImage: p.cardImage, heroImage: p.heroImage, gallery: p.gallery }];
      }),
    );
    let hasChanges = false;

    const normalizedCatalog = currentCatalog.map((tour) => {
      const expected = seedImageMap.get(tour.getId());
      if (!expected) return tour;

      const primitives = tour.toPrimitives();
      const needsCard = primitives.cardImage !== expected.cardImage && expected.cardImage.startsWith('/assets/tours/custom/');
      const needsHero = primitives.heroImage !== expected.heroImage && expected.heroImage.startsWith('/assets/tours/custom/');
      const needsGallery = expected.gallery.some(
        (img, i) => img.startsWith('/assets/tours/custom/') && primitives.gallery[i] !== img,
      );

      if (!needsCard && !needsHero && !needsGallery) return tour;

      hasChanges = true;
      const newGallery = [...primitives.gallery];
      expected.gallery.forEach((img, i) => {
        if (img.startsWith('/assets/tours/custom/')) newGallery[i] = img;
      });

      return Tour.restore({
        ...primitives,
        cardImage: needsCard ? expected.cardImage : primitives.cardImage,
        heroImage: needsHero ? expected.heroImage : primitives.heroImage,
        gallery: needsGallery ? newGallery : primitives.gallery,
      });
    });

    if (hasChanges) this.catalog.saveAll(normalizedCatalog);
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
