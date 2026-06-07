import type { IBookingRepository } from '../repositories/IBookingRepository';
import type { ICartRepository } from '../repositories/ICartRepository';
import type { ICatalogRepository } from '../repositories/ICatalogRepository';
import type { IPricingPlanRepository } from '../repositories/IPricingPlanRepository';
import type { ISessionRepository } from '../repositories/ISessionRepository';
import type { IUserRepository } from '../repositories/IUserRepository';
import type { AdminService } from '../services/AdminService';
import type { AuthGuard } from '../services/AuthGuard';
import type { AuthService } from '../services/AuthService';
import type { BookingService } from '../services/BookingService';
import type { CatalogService } from '../services/CatalogService';
import type { ReviewService } from '../services/ReviewService';

export interface AppStoreDependencies {
  catalogRepository: ICatalogRepository;
  userRepository: IUserRepository;
  bookingRepository: IBookingRepository;
  cartRepository: ICartRepository;
  pricingPlanRepository: IPricingPlanRepository;
  sessionRepository: ISessionRepository;
  authGuard: AuthGuard;
  authService: AuthService;
  bookingService: BookingService;
  catalogService: CatalogService;
  reviewService: ReviewService;
  adminService: AdminService;
}
