import type { BookingRequest } from '../../domain/booking/BookingRequest';
import { User } from '../../domain/people/User';
import { BookingRepository } from '../repositories/BookingRepository';
import { CartRepository } from '../repositories/CartRepository';
import { CatalogRepository } from '../repositories/CatalogRepository';
import { UserRepository } from '../repositories/UserRepository';
import { failureResult, successResult, type ServiceResult } from './ServiceResult';

export class BookingService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly cartRepository: CartRepository,
    private readonly catalogRepository: CatalogRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  public addToCart(
    userId: string,
    tourId: string,
    request: BookingRequest,
  ): ServiceResult<void> {
    const user = this.requireUser(userId);
    const tour = this.catalogRepository.findById(tourId);

    if (!user) {
      return failureResult('Log in as a traveler to create a booking.');
    }

    if (!tour) {
      return failureResult('Tour not found.');
    }

    const bookingErrors = tour.validateBookingRequest(request);

    if (bookingErrors.length > 0) {
      return failureResult(bookingErrors[0].message);
    }

    const cart = this.cartRepository.getOrCreateForUser(user);
    cart.addLine(tour.createBooking(userId, request));
    this.cartRepository.saveCart(cart);

    return successResult(undefined);
  }

  public updateCartBooking(
    userId: string,
    bookingId: string,
    request: BookingRequest,
  ): ServiceResult<void> {
    const user = this.requireUser(userId);

    if (!user) {
      return failureResult('Only logged in travelers can edit cart items.');
    }

    const cart = this.cartRepository.getOrCreateForUser(user);
    const cartBooking = cart
      .getLines()
      .find((line) => line.getId() === bookingId);

    if (!cartBooking) {
      return failureResult('Cart item not found.');
    }

    const tour = this.catalogRepository.findById(cartBooking.getTourId());

    if (!tour) {
      return failureResult('Tour no longer exists.');
    }

    const bookingErrors = tour.validateBookingRequest(request);

    if (bookingErrors.length > 0) {
      return failureResult(bookingErrors[0].message);
    }

    cartBooking.updateRequest(request, tour.quote(request).totalPrice);
    cart.replaceLine(cartBooking);
    this.cartRepository.saveCart(cart);

    return successResult(undefined);
  }

  public removeFromCart(userId: string, bookingId: string): ServiceResult<void> {
    const user = this.requireUser(userId);

    if (!user) {
      return failureResult('Only logged in travelers can edit cart items.');
    }

    const cart = this.cartRepository.getOrCreateForUser(user);
    cart.removeLine(bookingId);
    this.cartRepository.saveCart(cart);

    return successResult(undefined);
  }

  public checkout(userId: string): ServiceResult<number> {
    const user = this.requireUser(userId);

    if (!user) {
      return failureResult('Only logged in travelers can check out.');
    }

    const cart = this.cartRepository.getOrCreateForUser(user);
    const currentLines = cart.clear();

    if (currentLines.length === 0) {
      return failureResult('Your cart is empty.');
    }

    currentLines.forEach((booking) => booking.confirm());
    this.bookingRepository.addMany(currentLines);
    this.cartRepository.saveCart(cart);

    return successResult(currentLines.length);
  }

  private requireUser(userId: string): User | null {
    const person = this.userRepository.findById(userId);
    return person instanceof User ? person : null;
  }
}
