import { BaseEntity } from '../shared/BaseEntity';
import type { IDiscountable } from '../shared/contracts';

export interface PricingPlanPrimitives {
  id: string;
  title: string;
  monthlyPrice: number;
  description: string;
  annualDiscountPercent: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export class PricingPlan
  extends BaseEntity<PricingPlanPrimitives>
  implements IDiscountable
{
  public constructor(
    id: string,
    private readonly title: string,
    private readonly monthlyPrice: number,
    private readonly description: string,
    private readonly annualDiscountPercent: number,
    private readonly features: string[],
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getFeatures(): string[] {
    return [...this.features];
  }

  public getBasePrice(): number {
    return this.monthlyPrice;
  }

  public getDiscountedPrice(): number {
    return Number(
      (this.monthlyPrice * (1 - this.annualDiscountPercent / 100)).toFixed(2),
    );
  }

  public getDiscountLabel(): string | null {
    return this.annualDiscountPercent > 0
      ? `${this.annualDiscountPercent}% annual savings`
      : null;
  }

  public override toPrimitives(): PricingPlanPrimitives {
    return {
      id: this.id,
      title: this.title,
      monthlyPrice: this.monthlyPrice,
      description: this.description,
      annualDiscountPercent: this.annualDiscountPercent,
      features: this.getFeatures(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: PricingPlanPrimitives): PricingPlan {
    return new PricingPlan(
      primitives.id,
      primitives.title,
      primitives.monthlyPrice,
      primitives.description,
      primitives.annualDiscountPercent,
      primitives.features,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
