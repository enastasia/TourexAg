import { PricingPlan } from '../../domain/catalog/PricingPlan';

const seedDate = new Date('2026-03-29T08:00:00.000Z');

export const createSeedPricingPlans = (): PricingPlan[] => [
  new PricingPlan(
    'plan-basic',
    'Basic',
    299,
    'Built for solo travellers who need flexible essentials and clear support.',
    10,
    [
      'Advanced Segmentation',
      'Travel Tour Guideline',
      'Comparative Reporting',
      'Insurance Travel Quote',
      'Ticket Booking Area',
      '24/7 Customer Support',
    ],
    seedDate,
    seedDate,
  ),
  new PricingPlan(
    'plan-standard',
    'Standard',
    799,
    'The main bundle for couples and small groups planning curated experiences.',
    16,
    [
      'Advanced Segmentation',
      'Travel Tour Guideline',
      'Comparative Reporting',
      'Insurance Travel Quote',
      'Ticket Booking Area',
      '24/7 Customer Support',
    ],
    seedDate,
    seedDate,
  ),
  new PricingPlan(
    'plan-corporate',
    'Cooperate',
    999,
    'Premium planning with concierge support, larger allocations and admin controls.',
    18,
    [
      'Advanced Segmentation',
      'Travel Tour Guideline',
      'Comparative Reporting',
      'Insurance Travel Quote',
      'Ticket Booking Area',
      '24/7 Customer Support',
    ],
    seedDate,
    seedDate,
  ),
];
