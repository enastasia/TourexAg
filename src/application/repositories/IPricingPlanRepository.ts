import type { PricingPlan } from '../../domain/catalog/PricingPlan';

export interface IPricingPlanRepository {
  getAll(): PricingPlan[];
}
