import {
  PricingPlan,
  type PricingPlanPrimitives,
} from '../../domain/catalog/PricingPlan';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export class PricingPlanRepository extends BrowserStorageRepository<
  PricingPlan,
  PricingPlanPrimitives
> {
  public constructor() {
    super('tourex.pricingPlans');
  }

  public savePricingPlan(plan: PricingPlan): void {
    this.saveOrReplace(plan, (current) => current.getId() === plan.getId());
  }

  protected deserialize(record: PricingPlanPrimitives): PricingPlan {
    return PricingPlan.restore(record);
  }
}
