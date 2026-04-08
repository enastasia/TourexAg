import type { BookingRequest } from '../booking/BookingRequest';
import type { Tour } from './Tour';

export interface TourPriceQuote {
  originalUnitPrice: number;
  discountedUnitPrice: number;
  travellersCost: number;
  extrasCost: number;
  totalPrice: number;
}

export abstract class TourPricingStrategy {
  public quote(tour: Tour, request: BookingRequest): TourPriceQuote {
    const originalUnitPrice = tour.getBasePrice();
    const discountedUnitPrice = this.getDiscountedUnitPrice(tour);
    const tickets = request.getTickets();

    const travellersCost =
      tickets.adults * discountedUnitPrice +
      tickets.children * discountedUnitPrice * 0.58;

    const extras = request.getExtras();
    const extrasCost =
      (extras.servicePerBooking ? 30 : 0) +
      (extras.servicePerPerson ? request.getGuestCount() * 20 : 0);

    return {
      originalUnitPrice,
      discountedUnitPrice,
      travellersCost: Number(travellersCost.toFixed(2)),
      extrasCost: Number(extrasCost.toFixed(2)),
      totalPrice: Number((travellersCost + extrasCost).toFixed(2)),
    };
  }

  public getDiscountedUnitPrice(tour: Tour): number {
    return Number((tour.getBasePrice() * this.getUnitMultiplier(tour)).toFixed(2));
  }

  public getDiscountLabel(tour: Tour): string | null {
    const multiplier = this.getUnitMultiplier(tour);

    if (multiplier < 1) {
      return `${Math.round((1 - multiplier) * 100)}% off`;
    }

    if (multiplier > 1) {
      return 'Premium access';
    }

    return null;
  }

  protected abstract getUnitMultiplier(tour: Tour): number;
}

export class StandardTourPricingStrategy extends TourPricingStrategy {
  protected getUnitMultiplier(): number {
    return 1;
  }
}

export class FeaturedTourPricingStrategy extends TourPricingStrategy {
  protected getUnitMultiplier(): number {
    return 0.78;
  }
}

export class SeasonalTourPricingStrategy extends TourPricingStrategy {
  public constructor(private readonly seasonMultiplier: number) {
    super();
  }

  protected getUnitMultiplier(): number {
    return this.seasonMultiplier;
  }
}

export class PremiumTourPricingStrategy extends TourPricingStrategy {
  public constructor(private readonly premiumMultiplier: number) {
    super();
  }

  protected getUnitMultiplier(): number {
    return this.premiumMultiplier;
  }
}
