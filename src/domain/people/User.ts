import { Person, type PersonPrimitives } from './Person';
import type { PersonRole } from '../../shared/types/domain';
import { Wishlist, type WishlistPrimitives } from '../wishlist/Wishlist';

export interface UserPrimitives extends PersonPrimitives {
  role: 'user';
  wishlist: WishlistPrimitives;
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

  public toggleWishlist(tourId: string): boolean {
    const result = this.wishlist.toggleTour(tourId);
    this.touch();
    return result;
  }

  public hasWishlistedTour(tourId: string): boolean {
    return this.wishlist.hasTour(tourId);
  }

  public override toPrimitives(): UserPrimitives {
    return {
      id: this.id,
      role: 'user',
      fullName: this.fullName,
      email: this.email.getValue(),
      phone: this.phone.getValue(),
      avatar: this.avatar,
      passwordHash: this.passwordHash,
      wishlist: this.wishlist.toPrimitives(),
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
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
