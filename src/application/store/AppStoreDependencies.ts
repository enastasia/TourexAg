import type { BookingRepository } from '../repositories/BookingRepository';
import type { CartRepository } from '../repositories/CartRepository';
import type { CatalogRepository } from '../repositories/CatalogRepository';
import type { PricingPlanRepository } from '../repositories/PricingPlanRepository';
import type { SessionRepository } from '../repositories/SessionRepository';
import type { UserRepository } from '../repositories/UserRepository';
import type { AdminService } from '../services/AdminService';
import type { AuthGuard } from '../services/AuthGuard';
import type { AuthService } from '../services/AuthService';
import type { BookingService } from '../services/BookingService';
import type { CatalogService } from '../services/CatalogService';
import type { ReviewService } from '../services/ReviewService';

export interface AppStoreDependencies {
  catalogRepository: CatalogRepository;
  userRepository: UserRepository;
  bookingRepository: BookingRepository;
  cartRepository: CartRepository;
  pricingPlanRepository: PricingPlanRepository;
  sessionRepository: SessionRepository;
  authGuard: AuthGuard;
  authService: AuthService;
  bookingService: BookingService;
  catalogService: CatalogService;
  reviewService: ReviewService;
  adminService: AdminService;
}
