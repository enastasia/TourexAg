import { BaseEntity } from '../shared/BaseEntity';
import type { IUserOwned } from '../shared/contracts';
import type { BookingStatus, TourKind } from '../../shared/types/domain';
import { BookingRequest, type BookingRequestPrimitives } from './BookingRequest';

export interface BookingPrimitives {
  id: string;
  userId: string;
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  tourKind: TourKind;
  coverImage: string;
  destinationLabel: string;
  unitPrice: number;
  originalUnitPrice: number;
  discountLabel: string | null;
  totalPrice: number;
  status: BookingStatus;
  request: BookingRequestPrimitives;
  createdAt: string;
  updatedAt: string;
}

export class Booking extends BaseEntity<BookingPrimitives> implements IUserOwned {
  public constructor(
    id: string,
    private readonly userId: string,
    private readonly tourId: string,
    private readonly tourSlug: string,
    private readonly tourTitle: string,
    private readonly tourKind: TourKind,
    private readonly coverImage: string,
    private readonly destinationLabel: string,
    private readonly unitPrice: number,
    private readonly originalUnitPrice: number,
    private readonly discountLabel: string | null,
    private totalPrice: number,
    private status: BookingStatus,
    private request: BookingRequest,
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

  public getTourId(): string {
    return this.tourId;
  }

  public getTourSlug(): string {
    return this.tourSlug;
  }

  public getTourTitle(): string {
    return this.tourTitle;
  }

  public getTourKind(): TourKind {
    return this.tourKind;
  }

  public getCoverImage(): string {
    return this.coverImage;
  }

  public getDestinationLabel(): string {
    return this.destinationLabel;
  }

  public getUnitPrice(): number {
    return this.unitPrice;
  }

  public getOriginalUnitPrice(): number {
    return this.originalUnitPrice;
  }

  public getDiscountLabel(): string | null {
    return this.discountLabel;
  }

  public getRequest(): BookingRequest {
    return this.request;
  }

  public getTotalPrice(): number {
    return this.totalPrice;
  }

  public getStatus(): BookingStatus {
    return this.status;
  }

  public confirm(): void {
    if (this.status !== 'draft') {
      throw new Error('Only draft bookings can be confirmed.');
    }

    this.status = 'confirmed';
    this.touch();
  }

  public cancel(): void {
    if (this.status === 'cancelled') {
      throw new Error('Booking is already cancelled.');
    }

    this.status = 'cancelled';
    this.touch();
  }

  public updateRequest(request: BookingRequest, totalPrice: number): void {
    if (this.status !== 'draft') {
      throw new Error('Only draft bookings can be updated.');
    }

    this.request = request;
    this.totalPrice = totalPrice;
    this.touch();
  }

  public override toPrimitives(): BookingPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      tourId: this.tourId,
      tourSlug: this.tourSlug,
      tourTitle: this.tourTitle,
      tourKind: this.tourKind,
      coverImage: this.coverImage,
      destinationLabel: this.destinationLabel,
      unitPrice: this.unitPrice,
      originalUnitPrice: this.originalUnitPrice,
      discountLabel: this.discountLabel,
      totalPrice: this.totalPrice,
      status: this.status,
      request: this.request.toPrimitives(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: BookingPrimitives): Booking {
    return new Booking(
      primitives.id,
      primitives.userId,
      primitives.tourId,
      primitives.tourSlug,
      primitives.tourTitle,
      primitives.tourKind,
      primitives.coverImage,
      primitives.destinationLabel,
      primitives.unitPrice,
      primitives.originalUnitPrice,
      primitives.discountLabel,
      primitives.totalPrice,
      primitives.status,
      BookingRequest.restore(primitives.request),
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
