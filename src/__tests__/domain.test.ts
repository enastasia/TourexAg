import { describe, it, expect } from 'vitest';

import { User } from '../domain/people/User';
import { Admin } from '../domain/people/Admin';
import { Wishlist } from '../domain/wishlist/Wishlist';
import { BookingRequest } from '../domain/booking/BookingRequest';
import { Cart } from '../domain/booking/Cart';
import { Review } from '../domain/reviews/Review';
import { Tour } from '../domain/catalog/Tour';
import { TourFilter } from '../domain/catalog/TourFilter';
import { PricingPlan } from '../domain/catalog/PricingPlan';
import { Destination } from '../domain/catalog/Destination';
import { AuthSession } from '../domain/auth/AuthSession';
import {
  StandardTourPricingStrategy,
  FeaturedTourPricingStrategy,
  SeasonalTourPricingStrategy,
  PremiumTourPricingStrategy,
} from '../domain/catalog/TourPricing';
import { Email } from '../domain/shared/value-objects/Email';
import { Phone } from '../domain/shared/value-objects/Phone';
import { DomainException } from '../domain/shared/exceptions/DomainException';
import { BookingException } from '../domain/shared/exceptions/BookingException';
import { ValidationException } from '../domain/shared/exceptions/ValidationException';
import { EntityNotFoundException } from '../domain/shared/exceptions/EntityNotFoundException';
import { AuthenticationException } from '../domain/shared/exceptions/AuthenticationException';
import { hashPassword } from '../shared/utils/security';


function createDestination() {
  return new Destination('dest_1', 'Paris', 'France', 'Paris, France',
    'img.jpg', 'hero.jpg', 48.8566, 2.3522, 5);
}

function createTourProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tour_1', title: 'City Walk', slug: 'city-walk',
    summary: 'A beautiful city walk', heroImage: 'hero.jpg',
    cardImage: 'card.jpg', gallery: ['g1.jpg'], destination: createDestination(),
    basePrice: 200, locationNote: 'Paris center', durationDays: 3,
    transportMode: 'flightIncluded' as const, groupSize: 10,
    typeLabel: 'Standard', languages: ['en'], amenities: ['wifi'],
    highlightItems: [], includedItems: [], excludedItems: [],
    itinerary: [], reviews: [] as Review[], ribbonLabel: null,
    ...overrides,
  };
}

function createBookingRequest(overrides: Partial<{
  checkIn: string; checkOut: string; adults: number; children: number;
}> = {}) {
  return new BookingRequest(
    overrides.checkIn ?? '2026-07-01', overrides.checkOut ?? '2026-07-05',
    '12:00', { adults: overrides.adults ?? 2, children: overrides.children ?? 0 },
    { servicePerBooking: false, servicePerPerson: false }, {},
  );
}

function createUser(id = 'user_1') {
  return new User(id, 'John Doe', 'john@test.com', '+380123456789',
    'avatar.jpg', hashPassword('pass123'), new Wishlist('wl_1', id));
}

function createAdmin(id = 'admin_1') {
  return new Admin(id, 'Admin User', 'admin@test.com', '+380987654321',
    'avatar.jpg', hashPassword('admin'), ['manage_tours', 'manage_users']);
}

describe('BaseEntity — серіалізація та валідація', () => {
  it('toPrimitives() повертає примітивний обʼєкт із усіма полями', () => {
    const tour = new Tour(createTourProps());
    const p = tour.toPrimitives();
    expect(p.id).toBe('tour_1');
    expect(p.title).toBe('City Walk');
    expect(p.basePrice).toBe(200);
    expect(typeof p.createdAt).toBe('string');
  });

  it('isValid() повертає true для коректної сутності', () => {
    const tour = new Tour(createTourProps());
    expect(tour.isValid()).toBe(true);
    expect(tour.validate()).toHaveLength(0);
  });

  it('validate() повертає помилки для некоректних даних', () => {
    const tour = new Tour(createTourProps({ title: 'ab', basePrice: -1, durationDays: 0 }));
    const errors = tour.validate();
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.map(e => e.field)).toContain('title');
    expect(errors.map(e => e.field)).toContain('basePrice');
    expect(errors.map(e => e.field)).toContain('durationDays');
  });
});

describe('Person → User / Admin', () => {
  it('User.getRole() повертає "user"', () => {
    expect(createUser().getRole()).toBe('user');
  });

  it('Admin.getRole() повертає "admin"', () => {
    expect(createAdmin().getRole()).toBe('admin');
  });

  it('getDashboardSections() повертає різні набори', () => {
    expect(createUser().getDashboardSections()).toContain('Wishlist');
    expect(createAdmin().getDashboardSections()).toContain('Catalog');
  });

  it('matchesPasswordHash() перевіряє пароль без розкриття хешу', () => {
    const user = createUser();
    expect(user.matchesPasswordHash(hashPassword('pass123'))).toBe(true);
    expect(user.matchesPasswordHash(hashPassword('wrong'))).toBe(false);
  });

  it('updateProfile() оновлює дані й обрізає пробіли', () => {
    const user = createUser();
    user.updateProfile('  Jane Doe  ', '  +380111222333  ');
    expect(user.getFullName()).toBe('Jane Doe');
    expect(user.getPhone()).toBe('+380111222333');
  });

  it('Admin реалізує IAdminManageable', () => {
    const admin = createAdmin();
    expect(admin.getAdminActions()).toContain('manage_tours');
    expect(admin.canBeManagedBy('admin')).toBe(true);
    expect(admin.canBeManagedBy('user')).toBe(false);
  });

  it('серіалізація та десеріалізація User зберігає дані', () => {
    const user = createUser();
    const restored = User.restore(user.toPrimitives());
    expect(restored.getId()).toBe(user.getId());
    expect(restored.getEmail()).toBe(user.getEmail());
    expect(restored.getRole()).toBe('user');
  });
});

describe('Wishlist', () => {
  it('додавання та видалення турів', () => {
    const wl = new Wishlist('wl_1', 'user_1');
    wl.addTour('t1');
    wl.addTour('t2');
    expect(wl.getTourIds()).toEqual(['t1', 't2']);
    wl.removeTour('t1');
    expect(wl.getTourIds()).toEqual(['t2']);
  });

  it('toggleTour() перемикає стан', () => {
    const wl = new Wishlist('wl_1', 'user_1');
    expect(wl.toggleTour('t1')).toBe(true);
    expect(wl.hasTour('t1')).toBe(true);
    expect(wl.toggleTour('t1')).toBe(false);
    expect(wl.hasTour('t1')).toBe(false);
  });

  it('реалізує IUserOwned', () => {
    const wl = new Wishlist('wl_1', 'user_1');
    expect(wl.getOwnerId()).toBe('user_1');
    expect(wl.belongsToUser('user_1')).toBe(true);
    expect(wl.belongsToUser('user_2')).toBe(false);
  });
});

describe('Booking — інкапсуляція статусу', () => {
  function createDraftBooking(userId = 'user_1') {
    const tour = new Tour(createTourProps());
    return tour.createBooking(userId, createBookingRequest());
  }

  it('створюється зі статусом draft', () => {
    expect(createDraftBooking().getStatus()).toBe('draft');
  });

  it('confirm() змінює статус на confirmed', () => {
    const b = createDraftBooking();
    b.confirm();
    expect(b.getStatus()).toBe('confirmed');
  });

  it('confirm() кидає помилку для не-draft', () => {
    const b = createDraftBooking();
    b.confirm();
    expect(() => b.confirm()).toThrow('Only draft bookings can be confirmed.');
  });

  it('cancel() працює для draft та confirmed', () => {
    const b = createDraftBooking();
    b.cancel();
    expect(b.getStatus()).toBe('cancelled');
  });

  it('cancel() кидає помилку для вже скасованого', () => {
    const b = createDraftBooking();
    b.cancel();
    expect(() => b.cancel()).toThrow('Booking is already cancelled.');
  });

  it('реалізує IUserOwned', () => {
    const b = createDraftBooking('user_1');
    expect(b.belongsToUser('user_1')).toBe(true);
    expect(b.belongsToUser('user_2')).toBe(false);
  });
});

describe('Cart — агрегат', () => {
  function createCartWithBookings() {
    const tour = new Tour(createTourProps());
    const b1 = tour.createBooking('user_1', createBookingRequest({ adults: 1 }));
    const b2 = tour.createBooking('user_1', createBookingRequest({ adults: 2 }));
    const cart = new Cart('cart_1', 'user_1');
    cart.addLine(b1);
    cart.addLine(b2);
    return { cart, b1, b2 };
  }

  it('addLine додає бронювання до кошика', () => {
    const { cart } = createCartWithBookings();
    expect(cart.getLines()).toHaveLength(2);
  });

  it('removeLine видаляє за id', () => {
    const { cart, b1 } = createCartWithBookings();
    cart.removeLine(b1.getId());
    expect(cart.getLines()).toHaveLength(1);
  });

  it('clear() повертає всі позиції й очищує кошик', () => {
    const { cart } = createCartWithBookings();
    const lines = cart.clear();
    expect(lines).toHaveLength(2);
    expect(cart.getLines()).toHaveLength(0);
  });

  it('getTotalPrice() рахує суму', () => {
    const { cart } = createCartWithBookings();
    expect(cart.getTotalPrice()).toBeGreaterThan(0);
  });

  it('ensureEditableLine блокує бронювання іншого користувача', () => {
    const tour = new Tour(createTourProps());
    const foreignBooking = tour.createBooking('user_2', createBookingRequest());
    const cart = new Cart('cart_1', 'user_1');
    expect(() => cart.addLine(foreignBooking)).toThrow('Cart line must belong to the cart owner.');
  });

  it('ensureEditableLine блокує confirmed бронювання', () => {
    const tour = new Tour(createTourProps());
    const booking = tour.createBooking('user_1', createBookingRequest());
    booking.confirm();
    const cart = new Cart('cart_1', 'user_1');
    expect(() => cart.addLine(booking)).toThrow('Only draft bookings can be stored in a cart.');
  });
});

describe('Review — валідація', () => {
  const validScores = { location: 5, amenities: 4, services: 5, price: 4, rooms: 5 };

  it('валідний відгук проходить перевірку', () => {
    const r = new Review('r1', 'u1', 't1', 'John', 'Traveller', 'av.jpg',
      'This was an absolutely amazing tour experience!', validScores);
    expect(r.isValid()).toBe(true);
  });

  it('короткий коментар не проходить валідацію', () => {
    const r = new Review('r1', 'u1', 't1', 'John', 'Traveller', 'av.jpg',
      'Bad', validScores);
    expect(r.isValid()).toBe(false);
    expect(r.validate().map(e => e.field)).toContain('message');
  });

  it('оцінка за межами 1–5 не проходить валідацію', () => {
    const r = new Review('r1', 'u1', 't1', 'John', 'Traveller', 'av.jpg',
      'This was an absolutely amazing tour experience!',
      { location: 6, amenities: 0, services: 5, price: 4, rooms: 5 });
    expect(r.isValid()).toBe(false);
  });

  it('getAverageScore() рахує середнє', () => {
    const r = new Review('r1', 'u1', 't1', 'John', 'Traveller', 'av.jpg',
      'Great tour!!! Loved every moment of it.', { location: 5, amenities: 4, services: 5, price: 4, rooms: 5 });
    expect(r.getAverageScore()).toBeCloseTo(4.6, 1);
  });
});

describe('Tour — поліморфізм підтипів', () => {
  it('Tour.getKind() повертає "standard"', () => {
    expect(new Tour(createTourProps()).getKind()).toBe('standard');
  });

  it('Tour.restore() поліморфно створює правильний підтип', () => {
    const standard = Tour.restore({ ...new Tour(createTourProps()).toPrimitives(), kind: 'standard' });
    const featured = Tour.restore({ ...new Tour(createTourProps()).toPrimitives(), kind: 'featured' });
    const seasonal = Tour.restore({ ...new Tour(createTourProps()).toPrimitives(), kind: 'seasonal', seasonName: 'Winter', seasonMultiplier: 0.85 });
    const premium = Tour.restore({ ...new Tour(createTourProps()).toPrimitives(), kind: 'premium', premiumMultiplier: 1.15 });

    expect(standard.getKind()).toBe('standard');
    expect(featured.getKind()).toBe('featured');
    expect(seasonal.getKind()).toBe('seasonal');
    expect(premium.getKind()).toBe('premium');
  });

  it('getDiscountedPrice() різний для кожного підтипу', () => {
    const base = createTourProps({ basePrice: 100 });
    const standard = new Tour(base);
    const featured = Tour.restore({ ...standard.toPrimitives(), kind: 'featured' });
    const seasonal = Tour.restore({ ...standard.toPrimitives(), kind: 'seasonal', seasonName: 'Summer', seasonMultiplier: 0.9 });
    const premium = Tour.restore({ ...standard.toPrimitives(), kind: 'premium', premiumMultiplier: 1.2 });

    expect(standard.getDiscountedPrice()).toBe(100);
    expect(featured.getDiscountedPrice()).toBe(78);
    expect(seasonal.getDiscountedPrice()).toBe(90);
    expect(premium.getDiscountedPrice()).toBe(120);
  });

  it('getDiscountLabel() поліморфно повертає різні мітки', () => {
    const base = createTourProps();
    const standard = new Tour(base);
    const featured = Tour.restore({ ...standard.toPrimitives(), kind: 'featured' });

    expect(standard.getDiscountLabel()).toBeNull();
    expect(featured.getDiscountLabel()).toBe('Featured special');
  });

  it('Tour реалізує IBookable — canBeBooked + createBooking', () => {
    const tour = new Tour(createTourProps({ groupSize: 5 }));
    const validReq = createBookingRequest({ adults: 2 });
    const overReq = createBookingRequest({ adults: 6 });

    expect(tour.canBeBooked(validReq)).toBe(true);
    expect(tour.canBeBooked(overReq)).toBe(false);

    const booking = tour.createBooking('user_1', validReq);
    expect(booking.getStatus()).toBe('draft');
  });
});

describe('TourPricingStrategy — патерн «Стратегія»', () => {
  const tour = new Tour(createTourProps({ basePrice: 100 }));
  const request = createBookingRequest({ adults: 2, children: 1 });

  it('StandardTourPricingStrategy: множник 1.0', () => {
    const quote = new StandardTourPricingStrategy().quote(tour, request);
    expect(quote.discountedUnitPrice).toBe(100);
    expect(quote.totalPrice).toBeGreaterThan(0);
  });

  it('FeaturedTourPricingStrategy: множник 0.78', () => {
    const quote = new FeaturedTourPricingStrategy().quote(tour, request);
    expect(quote.discountedUnitPrice).toBe(78);
    expect(quote.totalPrice).toBeLessThan(
      new StandardTourPricingStrategy().quote(tour, request).totalPrice
    );
  });

  it('SeasonalTourPricingStrategy: змінний множник', () => {
    const quote = new SeasonalTourPricingStrategy(0.85).quote(tour, request);
    expect(quote.discountedUnitPrice).toBe(85);
  });

  it('PremiumTourPricingStrategy: множник > 1', () => {
    const quote = new PremiumTourPricingStrategy(1.2).quote(tour, request);
    expect(quote.discountedUnitPrice).toBe(120);
    expect(quote.totalPrice).toBeGreaterThan(
      new StandardTourPricingStrategy().quote(tour, request).totalPrice
    );
  });

  it('діти зі знижкою 42 % (множник 0.58)', () => {
    const childReq = createBookingRequest({ adults: 0, children: 1 });
    const quote = new StandardTourPricingStrategy().quote(tour, childReq);
    expect(quote.travellersCost).toBeCloseTo(58, 0);
  });
});

describe('BookingRequest — value object', () => {
  it('валідний запит проходить перевірку', () => {
    const req = createBookingRequest();
    expect(req.isValid()).toBe(true);
  });

  it('пустий checkInDate не проходить', () => {
    const req = createBookingRequest({ checkIn: '' });
    expect(req.isValid()).toBe(false);
    expect(req.validate().map(e => e.field)).toContain('checkInDate');
  });

  it('0 гостей не проходить', () => {
    const req = createBookingRequest({ adults: 0, children: 0 });
    expect(req.isValid()).toBe(false);
    expect(req.validate().map(e => e.field)).toContain('tickets');
  });

  it('validateTourParameters перевіряє обовʼязкові поля для featured', () => {
    const req = createBookingRequest();
    const errors = req.validateTourParameters('featured');
    expect(errors.map(e => e.field)).toContain('roomType');
    expect(errors.map(e => e.field)).toContain('mealPlan');
  });

  it('серіалізація та десеріалізація', () => {
    const req = createBookingRequest();
    const restored = BookingRequest.restore(req.toPrimitives());
    expect(restored.getGuestCount()).toBe(req.getGuestCount());
  });
});

describe('TourFilter — імутабельний value object', () => {
  it('createDefault() створює фільтр з усіма порожніми критеріями', () => {
    const f = TourFilter.createDefault();
    expect(f.getQuery()).toBe('');
    expect(f.getDestinations()).toEqual([]);
    expect(f.getPage()).toBe(1);
  });

  it('withChanges() повертає НОВИЙ обʼєкт, не мутує поточний', () => {
    const f1 = TourFilter.createDefault();
    const f2 = f1.withChanges({ query: 'paris' });
    expect(f1.getQuery()).toBe('');
    expect(f2.getQuery()).toBe('paris');
    expect(f1).not.toBe(f2);
  });

  it('withChanges(resetPage=true) скидає сторінку на 1', () => {
    const f = TourFilter.createDefault().withChanges({ page: 5 });
    const reset = f.withChanges({ query: 'new' }, true);
    expect(reset.getPage()).toBe(1);
  });

  it('серіалізація зберігає стан', () => {
    const f = TourFilter.createDefault().withChanges({ query: 'test', page: 3 });
    const restored = TourFilter.restore(f.toPrimitives());
    expect(restored.getQuery()).toBe('test');
    expect(restored.getPage()).toBe(3);
  });
});

describe('PricingPlan — IDiscountable', () => {
  it('getDiscountedPrice() застосовує річну знижку', () => {
    const plan = new PricingPlan('pp_1', 'Basic', 100, 'Basic plan', 20, ['feature1']);
    expect(plan.getBasePrice()).toBe(100);
    expect(plan.getDiscountedPrice()).toBe(80);
    expect(plan.getDiscountLabel()).toBe('20% annual savings');
  });

  it('без знижки getDiscountLabel() = null', () => {
    const plan = new PricingPlan('pp_2', 'Free', 0, 'Free plan', 0, []);
    expect(plan.getDiscountLabel()).toBeNull();
  });
});

describe('AuthSession', () => {
  it('зберігає userId та role', () => {
    const s = new AuthSession('s1', 'user_1', 'user');
    expect(s.getUserId()).toBe('user_1');
    expect(s.getRole()).toBe('user');
    expect(s.canAccessAdminArea()).toBe(false);
  });

  it('admin сесія дає доступ до адмін-панелі', () => {
    const s = new AuthSession('s2', 'admin_1', 'admin');
    expect(s.canAccessAdminArea()).toBe(true);
  });

  it('серіалізація та відновлення', () => {
    const s = new AuthSession('s1', 'user_1', 'user');
    const restored = AuthSession.restore(s.toPrimitives());
    expect(restored.getUserId()).toBe('user_1');
  });
});

describe('Destination', () => {
  it('зберігає геокоординати та назву', () => {
    const d = createDestination();
    expect(d.getCity()).toBe('Paris');
    expect(d.getCountry()).toBe('France');
    expect(d.getLatitude()).toBeCloseTo(48.8566);
    expect(d.getLongitude()).toBeCloseTo(2.3522);
  });
});

describe('Value Object — Email', () => {
  it('нормалізує значення до нижнього регістру', () => {
    const email = new Email('  User@Example.COM  ');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('isValid() повертає true для коректного email', () => {
    expect(new Email('test@example.com').isValid()).toBe(true);
  });

  it('isValid() повертає false для некоректного email', () => {
    expect(new Email('not-an-email').isValid()).toBe(false);
    expect(new Email('').isValid()).toBe(false);
  });

  it('equals() порівнює два email', () => {
    const a = new Email('user@test.com');
    const b = new Email('USER@test.com');
    const c = new Email('other@test.com');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('статичний isValid() працює без створення обʼєкта', () => {
    expect(Email.isValid('ok@test.com')).toBe(true);
    expect(Email.isValid('bad')).toBe(false);
  });
});

describe('Value Object — Phone', () => {
  it('зберігає значення з обрізаними пробілами', () => {
    const phone = new Phone('  +380123456789  ');
    expect(phone.getValue()).toBe('+380123456789');
  });

  it('isValid() повертає true для коректного номера', () => {
    expect(new Phone('+380123456789').isValid()).toBe(true);
    expect(new Phone('+380 12 345 6789').isValid()).toBe(true);
  });

  it('isValid() повертає false для некоректного номера', () => {
    expect(new Phone('12345').isValid()).toBe(false);
    expect(new Phone('').isValid()).toBe(false);
  });

  it('equals() порівнює нормалізовані номери', () => {
    const a = new Phone('+380 12 345 6789');
    const b = new Phone('+380123456789');
    expect(a.equals(b)).toBe(true);
  });

  it('статичний isValid() працює без створення обʼєкта', () => {
    expect(Phone.isValid('+380123456789')).toBe(true);
    expect(Phone.isValid('abc')).toBe(false);
  });
});

describe('Доменні виключення — ієрархія', () => {
  it('DomainException є базовим класом з кодом', () => {
    const ex = new DomainException('test error', 'TEST');
    expect(ex).toBeInstanceOf(Error);
    expect(ex).toBeInstanceOf(DomainException);
    expect(ex.message).toBe('test error');
    expect(ex.code).toBe('TEST');
    expect(ex.name).toBe('DomainException');
  });

  it('BookingException наслідує DomainException', () => {
    const ex = new BookingException('Cannot book');
    expect(ex).toBeInstanceOf(DomainException);
    expect(ex).toBeInstanceOf(BookingException);
    expect(ex.code).toBe('BOOKING_ERROR');
    expect(ex.name).toBe('BookingException');
  });

  it('ValidationException містить масив помилок', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'phone', message: 'Invalid phone' },
    ];
    const ex = new ValidationException(errors);
    expect(ex).toBeInstanceOf(DomainException);
    expect(ex.errors).toHaveLength(2);
    expect(ex.code).toBe('VALIDATION_ERROR');
    expect(ex.message).toContain('Invalid email');
  });

  it('EntityNotFoundException формує повідомлення з назвою сутності', () => {
    const ex = new EntityNotFoundException('Tour', 'tour_123');
    expect(ex).toBeInstanceOf(DomainException);
    expect(ex.code).toBe('ENTITY_NOT_FOUND');
    expect(ex.message).toContain('Tour');
    expect(ex.message).toContain('tour_123');
  });

  it('AuthenticationException має код AUTHENTICATION_ERROR', () => {
    const ex = new AuthenticationException('Bad credentials');
    expect(ex).toBeInstanceOf(DomainException);
    expect(ex.code).toBe('AUTHENTICATION_ERROR');
  });

  it('Booking.confirm() кидає BookingException для не-draft', () => {
    const tour = new Tour(createTourProps());
    const booking = tour.createBooking('user_1', createBookingRequest());
    booking.confirm();
    expect(() => booking.confirm()).toThrow(BookingException);
  });

  it('Cart.addLine() кидає BookingException для чужого бронювання', () => {
    const tour = new Tour(createTourProps());
    const foreignBooking = tour.createBooking('user_2', createBookingRequest());
    const cart = new Cart('cart_1', 'user_1');
    expect(() => cart.addLine(foreignBooking)).toThrow(BookingException);
  });
});
