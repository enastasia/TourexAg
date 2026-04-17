import { BookingRepository } from '../application/repositories/BookingRepository';
import { CartRepository } from '../application/repositories/CartRepository';
import { CatalogRepository } from '../application/repositories/CatalogRepository';
import { PricingPlanRepository } from '../application/repositories/PricingPlanRepository';
import { SessionRepository } from '../application/repositories/SessionRepository';
import { UserRepository } from '../application/repositories/UserRepository';
import type { AppStoreDependencies } from '../application/store/AppStoreDependencies';
import { AdminService } from '../application/services/AdminService';
import { AuthGuard } from '../application/services/AuthGuard';
import { AuthService } from '../application/services/AuthService';
import { BookingService } from '../application/services/BookingService';
import { CatalogService } from '../application/services/CatalogService';
import { ReviewService } from '../application/services/ReviewService';
import { TourMatcher } from '../application/services/TourMatcher';
import { DatabaseSeeder } from './DatabaseSeeder';

export const createAppStoreDependencies = (): AppStoreDependencies => {
  const catalogRepository = new CatalogRepository();
  const userRepository = new UserRepository();
  const bookingRepository = new BookingRepository();
  const cartRepository = new CartRepository();
  const pricingPlanRepository = new PricingPlanRepository();
  const sessionRepository = new SessionRepository();
  const tourMatcher = new TourMatcher();

  try {
    new DatabaseSeeder(
      catalogRepository,
      userRepository,
      bookingRepository,
      cartRepository,
      pricingPlanRepository,
    ).seed();
  } catch (error) {
    console.error(error);
  }

  return {
    catalogRepository,
    userRepository,
    bookingRepository,
    cartRepository,
    pricingPlanRepository,
    sessionRepository,
    authGuard: new AuthGuard(),
    authService: new AuthService(userRepository, cartRepository, sessionRepository),
    bookingService: new BookingService(
      userRepository,
      cartRepository,
      catalogRepository,
      bookingRepository,
    ),
    catalogService: new CatalogService(catalogRepository, tourMatcher),
    reviewService: new ReviewService(userRepository, catalogRepository),
    adminService: new AdminService(catalogRepository, userRepository),
  };
};
