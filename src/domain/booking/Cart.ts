import { BaseEntity } from '../shared/BaseEntity';
import type { IUserOwned } from '../shared/contracts';
import { BookingException } from '../shared/exceptions/BookingException';
import type { BookingPrimitives } from './Booking';
import { Booking } from './Booking';

export interface CartPrimitives {
  id: string;
  userId: string;
  lines: BookingPrimitives[];
  createdAt: string;
  updatedAt: string;
}

export class Cart extends BaseEntity<CartPrimitives> implements IUserOwned {
  public constructor(
    id: string,
    private readonly userId: string,
    private readonly lines: Booking[] = [],
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

  public getLines(): Booking[] {
    return [...this.lines];
  }

  public addLine(booking: Booking): void {
    this.ensureEditableLine(booking);
    this.lines.unshift(booking);
    this.touch();
  }

  public removeLine(bookingId: string): void {
    const nextLines = this.lines.filter((line) => line.getId() !== bookingId);

    if (nextLines.length !== this.lines.length) {
      this.lines.splice(0, this.lines.length, ...nextLines);
      this.touch();
    }
  }

  public replaceLine(booking: Booking): void {
    this.ensureEditableLine(booking);
    const index = this.lines.findIndex((line) => line.getId() === booking.getId());

    if (index >= 0) {
      this.lines.splice(index, 1, booking);
      this.touch();
    }
  }

  public clear(): Booking[] {
    const currentLines = this.getLines();
    this.lines.splice(0, this.lines.length);
    this.touch();
    return currentLines;
  }

  public getTotalPrice(): number {
    return this.lines.reduce((total, line) => total + line.getTotalPrice(), 0);
  }

  public getItemsCount(): number {
    return this.lines.length;
  }

  public override toPrimitives(): CartPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      lines: this.lines.map((line) => line.toPrimitives()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: CartPrimitives): Cart {
    return new Cart(
      primitives.id,
      primitives.userId,
      primitives.lines.map((line) => Booking.restore(line)),
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }

  private ensureEditableLine(booking: Booking): void {
    if (!booking.belongsToUser(this.userId)) {
      throw new BookingException('Cart line must belong to the cart owner.');
    }

    if (booking.getStatus() !== 'draft') {
      throw new BookingException('Only draft bookings can be stored in a cart.');
    }
  }
}
