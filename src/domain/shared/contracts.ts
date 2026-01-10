import type { ValidationError } from './ValidationError';

export interface ISerializable<TPrimitives> {
  toPrimitives(): TPrimitives;
}

export interface IValidatable {
  validate(): ValidationError[];
  isValid(): boolean;
}

export interface IUserOwned {
  getOwnerId(): string;
  belongsToUser(userId: string): boolean;
}

export interface IDiscountable {
  getBasePrice(): number;
  getDiscountedPrice(): number;
  getDiscountLabel(): string | null;
}

export interface IBookable<TRequest, TBooking> {
  canBeBooked(request: TRequest): boolean;
  createBooking(userId: string, request: TRequest): TBooking;
}

export interface IReviewable<TReview> {
  addReview(review: TReview): void;
  getReviews(): TReview[];
  getAverageRating(): number;
}

export interface IWishlistable {
  getWishlistKey(): string;
}

export interface IFilterable<TCriteria> {
  matches(criteria: TCriteria): boolean;
}

export interface IAdminManageable {
  getAdminActions(): string[];
  canBeManagedBy(role: string): boolean;
}
