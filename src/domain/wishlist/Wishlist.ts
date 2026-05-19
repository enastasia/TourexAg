import { BaseEntity } from '../shared/BaseEntity';
import type { IUserOwned } from '../shared/contracts';

export interface WishlistPrimitives {
  id: string;
  userId: string;
  tourIds: string[];
  createdAt: string;
  updatedAt: string;
}

export class Wishlist
  extends BaseEntity<WishlistPrimitives>
  implements IUserOwned
{
  public constructor(
    id: string,
    private readonly userId: string,
    private readonly tourIds: string[] = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getOwnerId(): string {
    return this.userId;
  }

  public belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  public getTourIds(): string[] {
    return [...this.tourIds];
  }

  public hasTour(tourId: string): boolean {
    return this.tourIds.includes(tourId);
  }

  public addTour(tourId: string): void {
    if (!this.hasTour(tourId)) {
      this.tourIds.push(tourId);
      this.touch();
    }
  }

  public removeTour(tourId: string): void {
    const nextTourIds = this.tourIds.filter((currentId) => currentId !== tourId);

    if (nextTourIds.length !== this.tourIds.length) {
      this.tourIds.splice(0, this.tourIds.length, ...nextTourIds);
      this.touch();
    }
  }

  public toggleTour(tourId: string): boolean {
    if (this.hasTour(tourId)) {
      this.removeTour(tourId);
      return false;
    }

    this.addTour(tourId);
    return true;
  }

  public override toPrimitives(): WishlistPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      tourIds: this.getTourIds(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: WishlistPrimitives): Wishlist {
    return new Wishlist(
      primitives.id,
      primitives.userId,
      primitives.tourIds,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
