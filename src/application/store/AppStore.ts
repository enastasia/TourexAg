import type { AuthSession } from '../../domain/auth/AuthSession';
import type { BookingRequest } from '../../domain/booking/BookingRequest';
import type { Booking } from '../../domain/booking/Booking';
import type { Cart } from '../../domain/booking/Cart';
import type { PricingPlan } from '../../domain/catalog/PricingPlan';
import type { Tour } from '../../domain/catalog/Tour';
import {
  TourFilter,
  type TourFilterPrimitives,
} from '../../domain/catalog/TourFilter';
import { Admin } from '../../domain/people/Admin';
import { User } from '../../domain/people/User';
import type { Review } from '../../domain/reviews/Review';
import type { StoredPerson } from '../repositories/IUserRepository';
import { AdminService, type AdminTourDraft } from '../services/AdminService';
import { AuthService, type LoginPayload, type RegisterPayload } from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import {
  CatalogService,
  type CatalogMeta,
  type CatalogPage,
  type DestinationSummary,
} from '../services/CatalogService';
import { ReviewService, type ReviewDraft } from '../services/ReviewService';
import {
  failureResult,
  type ServiceResult,
} from '../services/ServiceResult';
import type { AppStoreDependencies } from './AppStoreDependencies';

type FlashTone = 'success' | 'error';

type Listener = () => void;

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
  currentCart: Cart | null;
  pricingPlans: PricingPlan[];
  filter: TourFilter;
  isMenuOpen: boolean;
  flashMessage: FlashMessage | null;
}

export class AppStore {
  private readonly listeners = new Set<Listener>();

  private readonly catalogRepository: AppStoreDependencies['catalogRepository'];
  private readonly userRepository: AppStoreDependencies['userRepository'];
  private readonly bookingRepository: AppStoreDependencies['bookingRepository'];
  private readonly cartRepository: AppStoreDependencies['cartRepository'];
  private readonly pricingPlanRepository: AppStoreDependencies['pricingPlanRepository'];
  private readonly sessionRepository: AppStoreDependencies['sessionRepository'];
  private readonly authGuard: AppStoreDependencies['authGuard'];
  private readonly authService: AuthService;
  private readonly bookingService: BookingService;
  private readonly catalogService: CatalogService;
  private readonly reviewService: ReviewService;
  private readonly adminService: AdminService;

  private state: AppStoreState;
  private storageErrorMessage: string | null = null;

  public constructor(dependencies: AppStoreDependencies) {
    this.catalogRepository = dependencies.catalogRepository;
    this.userRepository = dependencies.userRepository;
    this.bookingRepository = dependencies.bookingRepository;
    this.cartRepository = dependencies.cartRepository;
    this.pricingPlanRepository = dependencies.pricingPlanRepository;
    this.sessionRepository = dependencies.sessionRepository;
    this.authGuard = dependencies.authGuard;
    this.authService = dependencies.authService;
    this.bookingService = dependencies.bookingService;
    this.catalogService = dependencies.catalogService;
    this.reviewService = dependencies.reviewService;
    this.adminService = dependencies.adminService;
    this.state = this.buildInitialState();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): AppStoreState {
    return this.state;
  }

  public toggleMenu(force?: boolean): void {
    this.setState({
      isMenuOpen: force ?? !this.state.isMenuOpen,
    });
  }

  public dismissFlash(): void {
    if (this.state.flashMessage) {
      this.setState({ flashMessage: null });
    }
  }

  public updateFilter(
    changes: Partial<TourFilterPrimitives>,
    resetPage = false,
  ): void {
    this.setState({
      filter: this.state.filter.withChanges(changes, resetPage),
    });
  }

  public resetFilter(): void {
    this.setState({
      filter: TourFilter.createDefault(),
    });
  }

  public login(payload: LoginPayload): ServiceResult<StoredPerson> {
    return this.runAction(() => {
      const result = this.authService.login(payload);

      if (!result.success || !result.data) {
        this.setFlash('error', result.error ?? 'Unable to log in.');
        return result;
      }

      this.setState({
        currentPerson: result.data,
        currentCart: this.resolveCart(result.data),
        session: this.sessionRepository.get(),
        flashMessage: {
          tone: 'success',
          text: 'Logged in successfully.',
        },
      });

      return result;
    }, 'Unable to log in.');
  }

  public register(payload: RegisterPayload): ServiceResult<User> {
    return this.runAction(() => {
      const result = this.authService.register(payload);

      if (!result.success || !result.data) {
        this.setFlash('error', result.error ?? 'Unable to register.');
        return result;
      }

      this.setState({
        currentPerson: result.data,
        currentCart: this.resolveCart(result.data),
        people: this.userRepository.getAll(),
        session: this.sessionRepository.get(),
        flashMessage: {
          tone: 'success',
          text: 'Account created successfully.',
        },
      });

      return result;
    }, 'Unable to register.');
  }

  public logout(): void {
    try {
      this.authService.logout();
      this.setState({
        currentPerson: null,
        currentCart: null,
        session: null,
        flashMessage: {
          tone: 'success',
          text: 'You have been logged out.',
        },
      });
    } catch (error) {
      this.setFlash('error', this.reportError(error, 'Unable to log out.'));
    }
  }

  public updateCurrentProfile(fullName: string, phone: string, avatar?: string): void {
    const person = this.state.currentPerson;
    if (!person) return;

    person.updateProfile(fullName, phone, avatar);
    this.userRepository.savePerson(person);

    const refreshedPerson = this.userRepository.findById(person.getId()) ?? person;
    this.setState({
      currentPerson: refreshedPerson,
      people: this.userRepository.getAll(),
      flashMessage: { tone: 'success', text: 'Profile updated.' },
    });
  }

  public toggleWishlist(tourId: string): ServiceResult<boolean> {
    return this.runAction(() => {
      const user = this.authGuard.requireUser(
        this.state.currentPerson,
        'Please log in as a traveler to manage your wishlist.',
      );

      if (!user.success || !user.data) {
        this.setFlash(
          'error',
          user.error ?? 'Please log in as a traveler to manage your wishlist.',
        );
        return failureResult(
          user.error ?? 'Please log in as a traveler to manage your wishlist.',
        );
      }

      if (!this.state.tours.some((tour) => tour.getId() === tourId)) {
        const error = 'Tour not found.';
        this.setFlash('error', error);
        return failureResult(error);
      }

      const currentUser = user.data;
      const isAdded = currentUser.toggleWishlist(tourId);
      this.userRepository.savePerson(currentUser);
      this.setState({
        currentPerson: currentUser,
        people: this.replacePerson(this.state.people, currentUser),
        flashMessage: {
          tone: 'success',
          text: isAdded ? 'Tour added to wishlist.' : 'Tour removed from wishlist.',
        },
      });

      return {
        success: true,
        data: isAdded,
      };
    }, 'Unable to update wishlist.');
  }

  public addToCart(
    tourId: string,
    request: BookingRequest,
  ): ServiceResult<void> {
    return this.runAction(() => {
      const user = this.authGuard.requireUser(
        this.state.currentPerson,
        'Please log in as a traveler to add tours to the cart.',
      );

      if (!user.success || !user.data) {
        this.setFlash(
          'error',
          user.error ?? 'Please log in as a traveler to add tours to the cart.',
        );
        return failureResult(
          user.error ?? 'Please log in as a traveler to add tours to the cart.',
        );
      }

      const result = this.bookingService.addToCart(user.data.getId(), tourId, request);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to add this tour to cart.');
        return result;
      }

      this.setState({
        currentCart: this.resolveCart(user.data),
        flashMessage: {
          tone: 'success',
          text: 'Tour added to cart.',
        },
      });

      return result;
    }, 'Unable to add this tour to cart.');
  }

  public updateCartBooking(
    bookingId: string,
    request: BookingRequest,
  ): ServiceResult<void> {
    return this.runAction(() => {
      const user = this.authGuard.requireUser(
        this.state.currentPerson,
        'Please log in as a traveler to edit cart items.',
      );

      if (!user.success || !user.data) {
        this.setFlash(
          'error',
          user.error ?? 'Please log in as a traveler to edit cart items.',
        );
        return failureResult(
          user.error ?? 'Please log in as a traveler to edit cart items.',
        );
      }

      const result = this.bookingService.updateCartBooking(
        user.data.getId(),
        bookingId,
        request,
      );

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to update cart item.');
        return result;
      }

      this.setState({
        currentCart: this.resolveCart(user.data),
        flashMessage: {
          tone: 'success',
          text: 'Cart updated.',
        },
      });

      return result;
    }, 'Unable to update cart item.');
  }

  public removeFromCart(bookingId: string): ServiceResult<void> {
    return this.runAction(() => {
      const user = this.authGuard.requireUser(
        this.state.currentPerson,
        'Please log in as a traveler to edit cart items.',
      );

      if (!user.success || !user.data) {
        this.setFlash(
          'error',
          user.error ?? 'Please log in as a traveler to edit cart items.',
        );
        return failureResult(
          user.error ?? 'Please log in as a traveler to edit cart items.',
        );
      }

      const result = this.bookingService.removeFromCart(user.data.getId(), bookingId);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to remove cart item.');
        return result;
      }

      this.setState({
        currentCart: this.resolveCart(user.data),
        flashMessage: {
          tone: 'success',
          text: 'Item removed from cart.',
        },
      });

      return result;
    }, 'Unable to remove cart item.');
  }

  public checkoutCart(): ServiceResult<number> {
    return this.runAction(() => {
      const user = this.authGuard.requireUser(
        this.state.currentPerson,
        'Please log in as a traveler to complete checkout.',
      );

      if (!user.success || !user.data) {
        this.setFlash(
          'error',
          user.error ?? 'Please log in as a traveler to complete checkout.',
        );
        return failureResult(
          user.error ?? 'Please log in as a traveler to complete checkout.',
        );
      }

      const result = this.bookingService.checkout(user.data.getId());

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to complete checkout.');
        return result;
      }

      this.setState({
        bookings: this.bookingRepository.getAll(),
        currentCart: this.resolveCart(user.data),
        flashMessage: {
          tone: 'success',
          text: `Checkout complete. ${result.data ?? 0} booking(s) confirmed.`,
        },
      });

      return result;
    }, 'Unable to complete checkout.');
  }

  public submitReview(draft: ReviewDraft): ServiceResult<void> {
    return this.runAction(() => {
      if (!this.state.currentPerson) {
        const error = 'Please log in before submitting a review.';
        this.setFlash('error', error);
        return failureResult(error);
      }

      const result = this.reviewService.createReview(
        this.state.currentPerson.getId(),
        draft,
      );

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to submit review.');
        return result;
      }

      this.setState({
        tours: this.catalogRepository.getAll(),
        flashMessage: {
          tone: 'success',
          text: 'Review submitted.',
        },
      });

      return result;
    }, 'Unable to submit review.');
  }

  public createTour(draft: AdminTourDraft): ServiceResult<Tour> {
    return this.runAction(() => {
      const admin = this.authGuard.requireAdmin(
        this.state.currentPerson,
        'Only admins can create tours.',
      );

      if (!admin.success) {
        this.setFlash('error', admin.error ?? 'Only admins can create tours.');
        return failureResult(admin.error ?? 'Only admins can create tours.');
      }

      const result = this.adminService.createTour(draft);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to create tour.');
        return result;
      }

      this.setState({
        tours: this.catalogRepository.getAll(),
        flashMessage: {
          tone: 'success',
          text: 'Tour created.',
        },
      });

      return result;
    }, 'Unable to create tour.');
  }

  public updateTour(
    tourId: string,
    draft: AdminTourDraft,
  ): ServiceResult<Tour> {
    return this.runAction(() => {
      const admin = this.authGuard.requireAdmin(
        this.state.currentPerson,
        'Only admins can edit tours.',
      );

      if (!admin.success) {
        this.setFlash('error', admin.error ?? 'Only admins can edit tours.');
        return failureResult(admin.error ?? 'Only admins can edit tours.');
      }

      const result = this.adminService.updateTour(tourId, draft);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to update tour.');
        return result;
      }

      this.setState({
        tours: this.catalogRepository.getAll(),
        flashMessage: {
          tone: 'success',
          text: 'Tour updated.',
        },
      });

      return result;
    }, 'Unable to update tour.');
  }

  public deleteTour(tourId: string): ServiceResult<void> {
    return this.runAction(() => {
      const admin = this.authGuard.requireAdmin(
        this.state.currentPerson,
        'Only admins can delete tours.',
      );

      if (!admin.success) {
        this.setFlash('error', admin.error ?? 'Only admins can delete tours.');
        return failureResult(admin.error ?? 'Only admins can delete tours.');
      }

      const result = this.adminService.deleteTour(tourId);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to delete tour.');
        return result;
      }

      this.setState({
        tours: this.catalogRepository.getAll(),
        flashMessage: {
          tone: 'success',
          text: 'Tour deleted.',
        },
      });

      return result;
    }, 'Unable to delete tour.');
  }

  public deleteReview(tourId: string, reviewId: string): ServiceResult<void> {
    return this.runAction(() => {
      const admin = this.authGuard.requireAdmin(
        this.state.currentPerson,
        'Only admins can delete reviews.',
      );

      if (!admin.success) {
        this.setFlash('error', admin.error ?? 'Only admins can delete reviews.');
        return failureResult(admin.error ?? 'Only admins can delete reviews.');
      }

      const result = this.adminService.deleteReview(tourId, reviewId);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to delete review.');
        return result;
      }

      this.setState({
        tours: this.catalogRepository.getAll(),
        flashMessage: { tone: 'success', text: 'Review deleted.' },
      });

      return result;
    }, 'Unable to delete review.');
  }

  public deleteUser(userId: string): ServiceResult<void> {
    return this.runAction(() => {
      const admin = this.authGuard.requireAdmin(
        this.state.currentPerson,
        'Only admins can delete users.',
      );

      if (!admin.success) {
        this.setFlash('error', admin.error ?? 'Only admins can delete users.');
        return failureResult(admin.error ?? 'Only admins can delete users.');
      }

      const result = this.adminService.deleteUser(userId);

      if (!result.success) {
        this.setFlash('error', result.error ?? 'Unable to delete user.');
        return result;
      }

      this.setState({
        people: this.userRepository.getAll(),
        flashMessage: { tone: 'success', text: 'User deleted.' },
      });

      return result;
    }, 'Unable to delete user.');
  }

  public getCatalogPage(): CatalogPage {
    return this.catalogService.getCatalogPage(this.state.filter);
  }

  public getCatalogMeta(): CatalogMeta {
    return this.catalogService.getMeta();
  }

  public getFeaturedTours(limit: number): Tour[] {
    return this.catalogService.getFeaturedTours(limit);
  }

  public getPopularTours(limit: number): Tour[] {
    return this.catalogService.getPopularTours(limit);
  }

  public getDestinationSummaries(limit: number): DestinationSummary[] {
    return this.catalogService.getTopDestinations(limit);
  }

  public getTestimonials(limit: number): Review[] {
    return this.catalogService.getTestimonials(limit);
  }

  public getTourBySlug(slug: string): Tour | undefined {
    return this.state.tours.find((tour) => tour.getSlug() === slug);
  }

  public getCustomers(): User[] {
    return this.state.people.filter((person): person is User => person instanceof User);
  }

  public getAdmins(): Admin[] {
    return this.state.people.filter(
      (person): person is Admin => person instanceof Admin,
    );
  }

  public getAllReviews(): Review[] {
    return this.state.tours
      .flatMap((tour) => tour.getReviews())
      .sort(
        (left, right) =>
          right.getCreatedAt().getTime() - left.getCreatedAt().getTime(),
      );
  }

  private buildInitialState(): AppStoreState {
    const people = this.readStorage(() => this.userRepository.getAll(), []);
    const session = this.readStorage(() => this.sessionRepository.get(), null);
    const currentPerson = session
      ? people.find((person) => person.getId() === session.getUserId()) ?? null
      : null;

    return {
      tours: this.readStorage(() => this.catalogRepository.getAll(), []),
      bookings: this.readStorage(() => this.bookingRepository.getAll(), []),
      people,
      session,
      currentPerson,
      currentCart: this.readStorage(() => this.resolveCart(currentPerson), null),
      pricingPlans: this.readStorage(() => this.pricingPlanRepository.getAll(), []),
      filter: TourFilter.createDefault(),
      isMenuOpen: false,
      flashMessage: this.storageErrorMessage
        ? {
            tone: 'error',
            text: this.storageErrorMessage,
          }
        : null,
    };
  }

  private resolveCart(person: StoredPerson | null): Cart | null {
    return person instanceof User ? this.cartRepository.getOrCreateForUser(person) : null;
  }

  private replacePerson(
    people: StoredPerson[],
    person: StoredPerson,
  ): StoredPerson[] {
    const index = people.findIndex((current) => current.getId() === person.getId());

    if (index < 0) {
      return [person, ...people];
    }

    return people.map((current) =>
      current.getId() === person.getId() ? person : current,
    );
  }

  private setFlash(tone: FlashTone, text: string): void {
    this.setState({
      flashMessage: {
        tone,
        text,
      },
    });
  }

  private runAction<T>(
    action: () => ServiceResult<T>,
    fallbackMessage: string,
  ): ServiceResult<T> {
    try {
      return action();
    } catch (error) {
      const message = this.reportError(error, fallbackMessage);
      this.setFlash('error', message);
      return failureResult(message);
    }
  }

  private readStorage<T>(reader: () => T, fallback: T): T {
    try {
      return reader();
    } catch (error) {
      this.storageErrorMessage = this.reportError(
        error,
        'Stored application data could not be loaded. Some local data was ignored.',
      );
      return fallback;
    }
  }

  private reportError(error: unknown, fallbackMessage: string): string {
    console.error(error);
    return fallbackMessage;
  }

  private setState(nextState: Partial<AppStoreState>): void {
    this.state = {
      ...this.state,
      ...nextState,
    };
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}
