import { Person, type PersonPrimitives } from './Person';
import type { PersonRole } from '../../shared/types/domain';
import { Cart, type CartPrimitives } from '../booking/Cart';
import { Wishlist, type WishlistPrimitives } from '../wishlist/Wishlist';
import type { Booking } from '../booking/Booking';

export interface UserPrimitives extends PersonPrimitives {
  role: 'user';
  wishlist: WishlistPrimitives;
  cart: CartPrimitives;
}

export class User extends Person<UserPrimitives> {
  public constructor(
    id: string,
    fullName: string,
    email: string,
    phone: string,
    avatar: string,
    passwordHash: string,
    private readonly wishlist: Wishlist,
    private readonly cart: Cart,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, fullName, email, phone, avatar, passwordHash, createdAt, updatedAt);
  }

  public override getRole(): PersonRole {
    return 'user';
  }

  public override getDashboardSections(): string[] {
    return ['Profile', 'Wishlist', 'Bookings', 'Cart'];
  }

  public getWishlist(): Wishlist {
    return this.wishlist;
  }

  public getCart(): Cart {
    return this.cart;
  }

  public toggleWishlist(tourId: string): boolean {
    const result = this.wishlist.toggleTour(tourId);
    this.touch();
    return result;
  }

  public hasWishlistedTour(tourId: string): boolean {
    return this.wishlist.hasTour(tourId);
  }

  public addBookingToCart(booking: Booking): void {
    this.cart.addLine(booking);
    this.touch();
  }

  public removeBookingFromCart(bookingId: string): void {
    this.cart.removeLine(bookingId);
    this.touch();
  }

  public clearCart(): Booking[] {
    this.touch();
    return this.cart.clear();
  }

  public override toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      role: 'user',
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      avatar: this.avatar,
      passwordHash: this.passwordHash,
      wishlist: this.wishlist.toPrimitives(),
      cart: this.cart.toPrimitives(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: UserPrimitives): User {
    return new User(
      primitives.id,
      primitives.fullName,
      primitives.email,
      primitives.phone,
      primitives.avatar,
      primitives.passwordHash,
      Wishlist.restore(primitives.wishlist),
      Cart.restore(primitives.cart),
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
