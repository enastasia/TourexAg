import type { AuthSession } from '../../domain/auth/AuthSession';
import type { Booking } from '../../domain/booking/Booking';
import type { BookingRequest } from '../../domain/booking/BookingRequest';
import { PricingPlan } from '../../domain/catalog/PricingPlan';
import type { Tour } from '../../domain/catalog/Tour';
import {
  TourFilter,
  type TourFilterPrimitives,
} from '../../domain/catalog/TourFilter';
import { Admin } from '../../domain/people/Admin';
import { User } from '../../domain/people/User';
import type { Review } from '../../domain/reviews/Review';
import { createSeedBookings } from '../../infrastructure/data/seedBookings';
import { createSeedPricingPlans } from '../../infrastructure/data/seedPricingPlans';
import { createSeedTours } from '../../infrastructure/data/seedCatalog';
import { createSeedUsers } from '../../infrastructure/data/seedUsers';
import { BookingRepository } from '../repositories/BookingRepository';
import { CatalogRepository } from '../repositories/CatalogRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import {
  UserRepository,
  type StoredPerson,
} from '../repositories/UserRepository';
import { AdminService, type AdminTourDraft } from '../services/AdminService';
import {
  AuthService,
  type LoginPayload,
  type RegisterPayload,
} from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import { CatalogService } from '../services/CatalogService';
import { failureResult, type ServiceResult } from '../services/ServiceResult';
import { ReviewService, type ReviewDraft } from '../services/ReviewService';

type FlashTone = 'success' | 'error';

export interface FlashMessage {
  tone: FlashTone;
  text: string;
}

export interface AppStoreState {
  tours: Tour[];
  bookings: Booking[];
  people: StoredPerson[];
  session: AuthSession | null;
  currentPerson: StoredPerson | null;
  pricingPlans: PricingPlan[];
  filter: TourFilter;
  isMenuOpen: boolean;
  flashMessage: FlashMessage | null;
}

type Listener = () => void;

export class AppStore {
  private readonly listeners = new Set<Listener>();
  private readonly catalogRepository = new CatalogRepository();
  private readonly userRepository = new UserRepository();
  private readonly bookingRepository = new BookingRepository();
  private readonly sessionRepository = new SessionRepository();
  private readonly catalogService = new CatalogService(this.catalogRepository);
  private readonly authService = new AuthService(
    this.userRepository,
    this.sessionRepository,
  );
  private readonly bookingService = new BookingService(
    this.userRepository,
    this.catalogRepository,
    this.bookingRepository,
  );
  private readonly reviewService = new ReviewService(
    this.userRepository,
    this.catalogRepository,
  );
  private readonly adminService = new AdminService(
    this.catalogRepository,
    this.userRepository,
  );
  private readonly pricingPlans = createSeedPricingPlans();

  private state: AppStoreState;

  public constructor() {
    this.seedDefaults();
    this.state = this.buildState(null, false, TourFilter.createDefault());
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): AppStoreState {
    return this.state;
  }

  public dismissFlash(): void {
    this.publishState({
      ...this.state,
      flashMessage: null,
    });
  }

  public toggleMenu(force?: boolean): void {
    this.publishState({
      ...this.state,
      isMenuOpen: force ?? !this.state.isMenuOpen,
    });
  }

  public updateFilter(
    changes: Partial<TourFilterPrimitives>,
    resetPage = false,
  ): void {
    this.publishState({
      ...this.state,
      filter: this.state.filter.withChanges(changes, resetPage),
    });
  }

  public resetFilter(): void {
    this.publishState({
      ...this.state,
      filter: TourFilter.createDefault(),
    });
  }

  public login(payload: LoginPayload): ServiceResult<StoredPerson> {
    const result = this.authService.login(payload);
    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Logged in successfully.',
          }
        : null,
    );
    return result;
  }

  public register(payload: RegisterPayload): ServiceResult<User> {
    const result = this.authService.register(payload);
    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Account created successfully.',
          }
        : null,
    );
    return result;
  }

  public logout(): void {
    this.authService.logout();
    this.publishState(this.buildState(
      {
        tone: 'success',
        text: 'You have been logged out.',
      },
      this.state.isMenuOpen,
      this.state.filter,
    ));
  }

  public toggleWishlist(tourId: string): ServiceResult<boolean> {
    if (!(this.state.currentPerson instanceof User)) {
      const result = failureResult<boolean>(
        'Please log in as a traveler to manage your wishlist.',
      );
      this.refresh(result);
      return result;
    }

    const added = this.state.currentPerson.toggleWishlist(tourId);
    this.userRepository.savePerson(this.state.currentPerson);
    const result = {
      success: true,
      data: added,
    };

    this.refresh(
      result,
      {
        tone: 'success',
        text: added ? 'Tour added to wishlist.' : 'Tour removed from wishlist.',
      },
    );

    return result;
  }

  public addToCart(tourId: string, request: BookingRequest): ServiceResult<void> {
    if (!(this.state.currentPerson instanceof User)) {
      const result = failureResult<void>(
        'Please log in as a traveler to add tours to the cart.',
      );
      this.refresh(result);
      return result;
    }

    const result = this.bookingService.addToCart(
      this.state.currentPerson.getId(),
      tourId,
      request,
    );

    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Tour added to cart.',
          }
        : null,
    );

    return result;
  }

  public updateCartBooking(
    bookingId: string,
    request: BookingRequest,
  ): ServiceResult<void> {
    if (!(this.state.currentPerson instanceof User)) {
      const result = failureResult<void>(
        'Please log in as a traveler to edit cart items.',
      );
      this.refresh(result);
      return result;
    }

    const result = this.bookingService.updateCartBooking(
      this.state.currentPerson.getId(),
      bookingId,
      request,
    );

    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Cart updated.',
          }
        : null,
    );

    return result;
  }

  public removeFromCart(bookingId: string): ServiceResult<void> {
    if (!(this.state.currentPerson instanceof User)) {
      const result = failureResult<void>(
        'Please log in as a traveler to edit cart items.',
      );
      this.refresh(result);
      return result;
    }

    const result = this.bookingService.removeFromCart(
      this.state.currentPerson.getId(),
      bookingId,
    );

    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Item removed from cart.',
          }
        : null,
    );

    return result;
  }

  public checkoutCart(): ServiceResult<number> {
    if (!(this.state.currentPerson instanceof User)) {
      const result = failureResult<number>(
        'Please log in as a traveler to complete checkout.',
      );
      this.refresh(result);
      return result;
    }

    const result = this.bookingService.checkout(this.state.currentPerson.getId());

    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: `Checkout complete. ${result.data} booking(s) confirmed.`,
          }
        : null,
    );

    return result;
  }

  public submitReview(draft: ReviewDraft): ServiceResult<void> {
    if (!this.state.currentPerson) {
      const result = failureResult<void>('Please log in before submitting a review.');
      this.refresh(result);
      return result;
    }

    const result = this.reviewService.createReview(
      this.state.currentPerson.getId(),
      draft,
    );

    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Review submitted.',
          }
        : null,
    );

    return result;
  }

  public createTour(draft: AdminTourDraft): ServiceResult<Tour> {
    if (!(this.state.currentPerson instanceof Admin)) {
      const result = failureResult<Tour>('Only admins can create tours.');
      this.refresh(result);
      return result;
    }

    const result = this.adminService.createTour(draft);
    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Tour created.',
          }
        : null,
    );

    return result;
  }

  public updateTour(
    tourId: string,
    draft: AdminTourDraft,
  ): ServiceResult<Tour> {
    if (!(this.state.currentPerson instanceof Admin)) {
      const result = failureResult<Tour>('Only admins can edit tours.');
      this.refresh(result);
      return result;
    }

    const result = this.adminService.updateTour(tourId, draft);
    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Tour updated.',
          }
        : null,
    );

    return result;
  }

  public deleteTour(tourId: string): ServiceResult<void> {
    if (!(this.state.currentPerson instanceof Admin)) {
      const result = failureResult<void>('Only admins can delete tours.');
      this.refresh(result);
      return result;
    }

    const result = this.adminService.deleteTour(tourId);
    this.refresh(
      result,
      result.success
        ? {
            tone: 'success',
            text: 'Tour deleted.',
          }
        : null,
    );

    return result;
  }

  public getCatalogPage() {
    return this.catalogService.getCatalogPage(this.state.filter);
  }

  public getFeaturedTours(limit: number): Tour[] {
    return this.catalogService.getFeaturedTours(limit);
  }

  public getPopularTours(limit: number): Tour[] {
    return this.catalogService.getPopularTours(limit);
  }

  public getDestinationSummaries(limit: number) {
    return this.catalogService.getTopDestinations(limit);
  }

  public getTestimonials(limit: number): Review[] {
    return this.catalogService.getTestimonials(limit);
  }

  public getTourBySlug(slug: string): Tour | undefined {
    return this.catalogService.getBySlug(slug);
  }

  public getCustomers(): User[] {
    return this.userRepository.getCustomers();
  }

  public getAdmins(): Admin[] {
    return this.state.people.filter((person): person is Admin => person instanceof Admin);
  }

  public getAllReviews(): Review[] {
    return this.reviewService.getAllReviews();
  }

  public getCatalogMeta() {
    return this.catalogService.getMeta();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  private publishState(nextState: AppStoreState): void {
    this.state = nextState;
    this.emit();
  }

  private seedDefaults(): void {
    const tours = createSeedTours();
    this.catalogRepository.seed(tours);
    this.catalogRepository.deleteToursByTitle(['авмвы']);
    this.catalogRepository.syncSeedCatalog(tours);
    this.catalogRepository.syncSeedGroupSizes(tours);
    this.catalogRepository.syncSeedFacets(tours);
    this.catalogRepository.syncSeedReviews(tours);
    this.userRepository.seed(createSeedUsers());
    this.bookingRepository.seed(createSeedBookings(tours));
  }

  private refresh(
    result: { success: boolean; error?: string },
    successMessage: FlashMessage | null = null,
  ): void {
    this.publishState(this.buildState(
      result.success
        ? successMessage
        : {
            tone: 'error',
            text: result.error ?? 'Unknown application error.',
          },
      this.state.isMenuOpen,
      this.state.filter,
    ));
  }

  private buildState(
    flashMessage: FlashMessage | null,
    isMenuOpen: boolean,
    filter: TourFilter,
  ): AppStoreState {
    const people = this.userRepository.getAll();
    const session = this.sessionRepository.get();
    const currentPerson = session
      ? people.find((person) => person.getId() === session.getUserId()) ?? null
      : null;

    return {
      tours: this.catalogRepository.getAll(),
      bookings: this.bookingRepository.getAll(),
      people,
      session,
      currentPerson,
      pricingPlans: this.pricingPlans,
      filter,
      isMenuOpen,
      flashMessage,
    };
  }
}
