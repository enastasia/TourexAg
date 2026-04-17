export const SEED_CREDENTIALS = {
  traveler: {
    email: 'traveler@tourex.test',
    password: 'traveler123',
  },
  admin: {
    email: 'admin@tourex.test',
    password: 'admin123',
  },
} as const;

export const SEED_IDS = {
  people: {
    traveler: 'user_seed_traveler',
    admin: 'admin_seed_manager',
  },
  wishlists: {
    traveler: 'wishlist_seed_traveler',
  },
  carts: {
    traveler: 'cart_seed_traveler',
  },
  destinations: {
    maldives: 'dest_maldives',
    paris: 'dest_paris',
    tokyo: 'dest_tokyo',
    cairo: 'dest_cairo',
    bali: 'dest_bali',
    peru: 'dest_peru',
    norway: 'dest_norway',
    greece: 'dest_greece',
  },
  tours: {
    maldives: 'tour_maldives_escape',
    paris: 'tour_paris_culture',
    tokyo: 'tour_tokyo_lights',
    cairo: 'tour_cairo_heritage',
    bali: 'tour_bali_wellness',
    peru: 'tour_peru_andes',
    norway: 'tour_norway_fjords',
    greece: 'tour_greece_islands',
  },
  pricingPlans: {
    explorer: 'pricing_explorer',
    family: 'pricing_family',
    concierge: 'pricing_concierge',
  },
} as const;
