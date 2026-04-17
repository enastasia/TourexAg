import { PricingPlan } from '../../domain/catalog/PricingPlan';
import { SEED_IDS } from './seedIds';

export const createSeedPricingPlans = (): PricingPlan[] => [
  new PricingPlan(
    SEED_IDS.pricingPlans.explorer,
    'Explorer',
    39,
    'For solo travelers planning a compact set of curated routes.',
    8,
    ['Saved routes', 'Flexible date tracking', 'Email support'],
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
  new PricingPlan(
    SEED_IDS.pricingPlans.family,
    'Family',
    79,
    'For shared planning, multi-person bookings and longer itineraries.',
    14,
    ['Shared wishlist', 'Group booking support', 'Priority itinerary review'],
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
  new PricingPlan(
    SEED_IDS.pricingPlans.concierge,
    'Concierge',
    149,
    'For premium trips that need hands-on routing and private support.',
    18,
    ['Private guide options', '24/7 trip desk', 'Custom destination matching'],
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
];
