// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';

import { AuthService } from '../application/services/AuthService';
import { BookingService } from '../application/services/BookingService';
import { CatalogService } from '../application/services/CatalogService';
import { ReviewService } from '../application/services/ReviewService';
import { AdminService } from '../application/services/AdminService';
import { AuthGuard } from '../application/services/AuthGuard';
import { TourMatcher } from '../application/services/TourMatcher';

import { UserRepository } from '../application/repositories/UserRepository';
import { CartRepository } from '../application/repositories/CartRepository';
import { CatalogRepository } from '../application/repositories/CatalogRepository';
import { BookingRepository } from '../application/repositories/BookingRepository';
import { SessionRepository } from '../application/repositories/SessionRepository';
import { PricingPlanRepository } from '../application/repositories/PricingPlanRepository';

import { DatabaseSeeder } from '../infrastructure/DatabaseSeeder';

import { BookingRequest } from '../domain/booking/BookingRequest';
import { TourFilter } from '../domain/catalog/TourFilter';
import { User } from '../domain/people/User';
import { Admin } from '../domain/people/Admin';
import { SEED_CREDENTIALS, SEED_IDS } from '../infrastructure/data/seedIds';

let userRepo: UserRepository;
let cartRepo: CartRepository;
let catalogRepo: CatalogRepository;
let bookingRepo: BookingRepository;
let sessionRepo: SessionRepository;
let pricingRepo: PricingPlanRepository;

let authService: AuthService;
let bookingService: BookingService;
let catalogService: CatalogService;
let reviewService: ReviewService;
let adminService: AdminService;
let authGuard: AuthGuard;

beforeEach(() => {
  localStorage.clear();

  userRepo = new UserRepository();
  cartRepo = new CartRepository();
  catalogRepo = new CatalogRepository();
  bookingRepo = new BookingRepository();
  sessionRepo = new SessionRepository();
  pricingRepo = new PricingPlanRepository();

  new DatabaseSeeder(catalogRepo, userRepo, bookingRepo, cartRepo, pricingRepo).seed();

  authGuard = new AuthGuard();
  authService = new AuthService(userRepo, cartRepo, sessionRepo);
  bookingService = new BookingService(userRepo, cartRepo, catalogRepo, bookingRepo);
  catalogService = new CatalogService(catalogRepo, new TourMatcher());
  reviewService = new ReviewService(userRepo, catalogRepo);
  adminService = new AdminService(catalogRepo, userRepo);
});

function validRequest() {
  return new BookingRequest(
    '2026-08-01', '2026-08-05', '12:00',
    { adults: 2, children: 0 },
    { servicePerBooking: false, servicePerPerson: false },
    {},
  );
}

describe('Реєстрація та авторизація', () => {
  it('реєстрація створює користувача, кошик і сесію', () => {
    const result = authService.register({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+380123456789',
      password: 'test123',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(User);
    expect(result.data!.getEmail()).toBe('test@example.com');

    const session = sessionRepo.get();
    expect(session).not.toBeNull();
    expect(session!.getUserId()).toBe(result.data!.getId());

    const cart = cartRepo.findByUserId(result.data!.getId());
    expect(cart).not.toBeUndefined();
  });

  it('повторна реєстрація з тим самим email — помилка', () => {
    authService.register({
      fullName: 'First', email: 'dup@test.com',
      phone: '+380111111111', password: '123',
    });
    const result = authService.register({
      fullName: 'Second', email: 'dup@test.com',
      phone: '+380222222222', password: '456',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('Вхід та вихід з системи', () => {
  it('вхід з правильними seed-даними', () => {
    const result = authService.login({
      email: SEED_CREDENTIALS.traveler.email,
      password: SEED_CREDENTIALS.traveler.password,
    });
    expect(result.success).toBe(true);
    expect(result.data!.getRole()).toBe('user');
  });

  it('вхід адміністратора', () => {
    const result = authService.login({
      email: SEED_CREDENTIALS.admin.email,
      password: SEED_CREDENTIALS.admin.password,
    });
    expect(result.success).toBe(true);
    expect(result.data!.getRole()).toBe('admin');
  });

  it('вхід з неправильним паролем — помилка', () => {
    const result = authService.login({
      email: SEED_CREDENTIALS.traveler.email,
      password: 'wrong_password',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Incorrect password');
  });

  it('logout очищує сесію', () => {
    authService.login({
      email: SEED_CREDENTIALS.traveler.email,
      password: SEED_CREDENTIALS.traveler.password,
    });
    expect(sessionRepo.get()).not.toBeNull();
    authService.logout();
    expect(sessionRepo.get()).toBeNull();
  });
});

describe('Фільтрація каталогу', () => {
  it('без фільтрів повертає всі тури', () => {
    const page = catalogService.getCatalogPage(TourFilter.createDefault());
    expect(page.totalItems).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it('фільтр за напрямком скорочує результати', () => {
    const allPage = catalogService.getCatalogPage(TourFilter.createDefault());
    const filtered = catalogService.getCatalogPage(
      TourFilter.createDefault().withChanges({ destinations: [SEED_IDS.destinations.paris] }),
    );
    expect(filtered.totalItems).toBeLessThan(allPage.totalItems);
    expect(filtered.totalItems).toBeGreaterThan(0);
  });

  it('фільтр за ціновим діапазоном', () => {
    const filtered = catalogService.getCatalogPage(
      TourFilter.createDefault().withChanges({ priceRange: [100, 300] as [number, number] }),
    );
    filtered.items.forEach(tour => {
      expect(tour.getDiscountedPrice()).toBeGreaterThanOrEqual(100);
      expect(tour.getDiscountedPrice()).toBeLessThanOrEqual(300);
    });
  });

  it('текстовий пошук за назвою туру', () => {
    const allTours = catalogService.getAllTours();
    const firstTitle = allTours[0].getTitle();
    const keyword = firstTitle.split(' ')[0];
    const filtered = catalogService.getCatalogPage(
      TourFilter.createDefault().withChanges({ query: keyword }),
    );
    expect(filtered.totalItems).toBeGreaterThan(0);
  });

  it('пагінація працює коректно', () => {
    const page1 = catalogService.getCatalogPage(
      TourFilter.createDefault().withChanges({ pageSize: 2, page: 1 }),
    );
    const page2 = catalogService.getCatalogPage(
      TourFilter.createDefault().withChanges({ pageSize: 2, page: 2 }),
    );
    expect(page1.currentPage).toBe(1);
    expect(page2.currentPage).toBe(2);
    if (page1.totalPages > 1) {
      expect(page1.items[0].getId()).not.toBe(page2.items[0].getId());
    }
  });
});

describe('Додавання туру до кошика', () => {
  it('авторизований користувач додає тур до кошика', () => {
    const userId = SEED_IDS.people.traveler;
    const tourId = SEED_IDS.tours.paris;
    const result = bookingService.addToCart(userId, tourId, validRequest());
    expect(result.success).toBe(true);

    const cart = cartRepo.findByUserId(userId)!;
    expect(cart.getLines().length).toBeGreaterThanOrEqual(1);
  });

  it('неіснуючий тур — помилка', () => {
    const result = bookingService.addToCart(SEED_IDS.people.traveler, 'fake_tour', validRequest());
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('неавторизований (неіснуючий) користувач — помилка', () => {
    const result = bookingService.addToCart('fake_user', SEED_IDS.tours.paris, validRequest());
    expect(result.success).toBe(false);
  });
});

describe('Оформлення замовлення (checkout)', () => {
  it('checkout переміщує позиції з кошика до бронювань', () => {
    const userId = SEED_IDS.people.traveler;
    bookingService.addToCart(userId, SEED_IDS.tours.paris, validRequest());

    const bookingsBefore = bookingRepo.getAll().length;
    const result = bookingService.checkout(userId);

    expect(result.success).toBe(true);
    expect(result.data).toBeGreaterThanOrEqual(1);

    const cart = cartRepo.findByUserId(userId)!;
    expect(cart.getLines()).toHaveLength(0);

    expect(bookingRepo.getAll().length).toBeGreaterThan(bookingsBefore);
  });

  it('checkout з порожнім кошиком — помилка', () => {
    const userId = SEED_IDS.people.traveler;
    const cart = cartRepo.getOrCreateForUser(userRepo.findById(userId)! as User);
    cart.clear();
    cartRepo.saveCart(cart);

    const result = bookingService.checkout(userId);
    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });
});

describe('Відгуки', () => {
  it('авторизований користувач залишає відгук', () => {
    const tour = catalogService.getAllTours()[0];
    const reviewsBefore = tour.getReviewCount();

    const result = reviewService.createReview(SEED_IDS.people.traveler, {
      tourId: tour.getId(),
      message: 'This was an absolutely fantastic tour experience, highly recommend!',
      scores: { location: 5, amenities: 4, services: 5, price: 4, rooms: 5 },
    });

    expect(result.success).toBe(true);

    const updated = catalogRepo.findById(tour.getId())!;
    expect(updated.getReviewCount()).toBe(reviewsBefore + 1);
  });

  it('відгук з коротким коментарем — помилка', () => {
    const tour = catalogService.getAllTours()[0];
    const result = reviewService.createReview(SEED_IDS.people.traveler, {
      tourId: tour.getId(),
      message: 'Bad',
      scores: { location: 5, amenities: 5, services: 5, price: 5, rooms: 5 },
    });
    expect(result.success).toBe(false);
  });

  it('відгук з некоректними оцінками — помилка', () => {
    const tour = catalogService.getAllTours()[0];
    const result = reviewService.createReview(SEED_IDS.people.traveler, {
      tourId: tour.getId(),
      message: 'Wonderful experience, I enjoyed every moment of this trip!',
      scores: { location: 6, amenities: 0, services: 5, price: 4, rooms: 5 },
    });
    expect(result.success).toBe(false);
  });
});

describe('Список бажаного', () => {
  it('toggle додає і прибирає тур', () => {
    const user = userRepo.findById(SEED_IDS.people.traveler) as User;
    const tourId = SEED_IDS.tours.cairo;

    const wasAdded = user.toggleWishlist(tourId);
    expect(wasAdded).toBe(true);
    expect(user.hasWishlistedTour(tourId)).toBe(true);

    const wasRemoved = user.toggleWishlist(tourId);
    expect(wasRemoved).toBe(false);
    expect(user.hasWishlistedTour(tourId)).toBe(false);
  });
});

describe('Адміністративні операції', () => {
  it('AuthGuard блокує звичайного користувача', () => {
    const user = userRepo.findById(SEED_IDS.people.traveler)!;
    const guard = authGuard.requireAdmin(user, 'Access denied');
    expect(guard.success).toBe(false);
    expect(guard.error).toBe('Access denied');
  });

  it('AuthGuard пропускає адміністратора', () => {
    const admin = userRepo.findById(SEED_IDS.people.admin)!;
    const guard = authGuard.requireAdmin(admin, 'Access denied');
    expect(guard.success).toBe(true);
    expect(guard.data).toBeInstanceOf(Admin);
  });

  it('адміністратор створює новий тур', () => {
    const toursBefore = catalogService.getAllTours().length;
    const result = adminService.createTour({
      title: 'Test Tour Created by Admin',
      summary: 'A test tour',
      destinationId: SEED_IDS.destinations.paris,
      basePrice: 500,
      durationDays: 5,
      groupSize: 10,
      typeLabel: 'Standard',
      kind: 'standard',
      imageUrl: '',
      ribbonLabel: '',
    });
    expect(result.success).toBe(true);
    expect(catalogService.getAllTours().length).toBe(toursBefore + 1);
  });

  it('адміністратор редагує існуючий тур', () => {
    const tour = catalogService.getAllTours()[0];
    const result = adminService.updateTour(tour.getId(), {
      title: 'Updated Tour Title',
      summary: tour.getSummary(),
      destinationId: tour.getDestination().getId(),
      basePrice: 999,
      durationDays: tour.getDurationDays(),
      groupSize: tour.getGroupSize(),
      typeLabel: tour.getTypeLabel(),
      kind: tour.getKind(),
      imageUrl: '',
      ribbonLabel: '',
    });
    expect(result.success).toBe(true);
    expect(catalogRepo.findById(tour.getId())!.getTitle()).toBe('Updated Tour Title');
  });

  it('адміністратор видаляє тур', () => {
    const tours = catalogService.getAllTours();
    const tourToDelete = tours[tours.length - 1];
    const countBefore = tours.length;

    adminService.deleteTour(tourToDelete.getId());
    expect(catalogService.getAllTours().length).toBe(countBefore - 1);
  });
});

describe('Ціноутворення для різних типів турів', () => {
  it('standard тур — базова ціна без знижки', () => {
    const tour = catalogService.getAllTours().find(t => t.getKind() === 'standard')!;
    expect(tour.getDiscountedPrice()).toBe(tour.getBasePrice());
    expect(tour.getDiscountLabel()).toBeNull();
  });

  it('featured тур — знижка 22%', () => {
    const tour = catalogService.getAllTours().find(t => t.getKind() === 'featured');
    if (tour) {
      expect(tour.getDiscountedPrice()).toBeCloseTo(tour.getBasePrice() * 0.78, 0);
      expect(tour.getDiscountLabel()).toBe('Featured special');
    }
  });

  it('seasonal тур — знижка за сезонним множником', () => {
    const tour = catalogService.getAllTours().find(t => t.getKind() === 'seasonal');
    if (tour) {
      expect(tour.getDiscountedPrice()).toBeLessThan(tour.getBasePrice());
    }
  });

  it('premium тур — надбавка до ціни', () => {
    const tour = catalogService.getAllTours().find(t => t.getKind() === 'premium');
    if (tour) {
      expect(tour.getDiscountedPrice()).toBeGreaterThan(tour.getBasePrice());
      expect(tour.getDiscountLabel()).toBe('Private concierge');
    }
  });
});

describe('Індивідуальні параметри бронювання', () => {
  it('featured тур вимагає roomType та mealPlan', () => {
    const featured = catalogService.getAllTours().find(t => t.getKind() === 'featured');
    if (featured) {
      const reqWithout = validRequest();
      const errors = featured.validateBookingRequest(reqWithout);
      const fields = errors.map(e => e.field);
      expect(fields).toContain('roomType');
      expect(fields).toContain('mealPlan');
    }
  });

  it('standard тур не вимагає додаткових параметрів', () => {
    const standard = catalogService.getAllTours().find(t => t.getKind() === 'standard')!;
    const req = validRequest();
    const errors = standard.validateBookingRequest(req);
    expect(errors).toHaveLength(0);
  });
});

describe('Збереження даних у localStorage', () => {
  it('дані турів зберігаються між операціями', () => {
    const tours1 = catalogRepo.getAll();
    const tours2 = new CatalogRepository().getAll();
    expect(tours2.length).toBe(tours1.length);
    expect(tours2[0].getId()).toBe(tours1[0].getId());
  });

  it('сесія зберігається після входу', () => {
    authService.login({
      email: SEED_CREDENTIALS.traveler.email,
      password: SEED_CREDENTIALS.traveler.password,
    });
    const freshSessionRepo = new SessionRepository();
    expect(freshSessionRepo.get()).not.toBeNull();
  });
});
