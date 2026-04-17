import { Destination } from '../../domain/catalog/Destination';
import {
  FeaturedTour,
  PremiumTour,
  SeasonalTour,
  Tour,
} from '../../domain/catalog/Tour';
import { Review } from '../../domain/reviews/Review';
import type { TourKind, TourTransportMode } from '../../shared/types/domain';
import { SEED_IDS } from './seedIds';

const createdAt = new Date('2026-01-06T10:00:00.000Z');

const destination = (
  id: string,
  city: string,
  country: string,
  image: string,
  latitude: number,
  longitude: number,
) =>
  new Destination(
    id,
    city,
    country,
    `${city}, ${country}`,
    image,
    image,
    latitude,
    longitude,
    1,
    createdAt,
    createdAt,
  );

const destinations = {
  maldives: destination(
    SEED_IDS.destinations.maldives,
    'Male',
    'Maldives',
    '/assets/hero-slider/slide-1.jpg',
    4.1755,
    73.5093,
  ),
  paris: destination(
    SEED_IDS.destinations.paris,
    'Paris',
    'France',
    '/assets/decor/decor-eiffel.webp',
    48.8566,
    2.3522,
  ),
  tokyo: destination(
    SEED_IDS.destinations.tokyo,
    'Tokyo',
    'Japan',
    '/assets/decor/decor-map-asia.webp',
    35.6762,
    139.6503,
  ),
  cairo: destination(
    SEED_IDS.destinations.cairo,
    'Cairo',
    'Egypt',
    '/assets/decor/decor-pyramids.webp',
    30.0444,
    31.2357,
  ),
  bali: destination(
    SEED_IDS.destinations.bali,
    'Bali',
    'Indonesia',
    '/assets/hero-slider/slide-2.jpg',
    -8.3405,
    115.092,
  ),
  peru: destination(
    SEED_IDS.destinations.peru,
    'Cusco',
    'Peru',
    '/assets/decor/decor-map-americas.webp',
    -13.5319,
    -71.9675,
  ),
  norway: destination(
    SEED_IDS.destinations.norway,
    'Bergen',
    'Norway',
    '/assets/hero-slider/slide-4.jpg',
    60.3913,
    5.3221,
  ),
  greece: destination(
    SEED_IDS.destinations.greece,
    'Santorini',
    'Greece',
    '/assets/hero-slider/slide-5.jpg',
    36.3932,
    25.4615,
  ),
};

const reviews = (tourId: string) => [
  new Review(
    `review-${tourId}-1`,
    SEED_IDS.people.traveler,
    tourId,
    'Sofia Traveler',
    'Verified Traveller',
    'https://i.pravatar.cc/300?u=traveler@tourex.test',
    'The itinerary was paced well, the guide was clear, and the route felt easy to follow.',
    {
      location: 5,
      amenities: 5,
      services: 5,
      price: 4,
      rooms: 5,
    },
    new Date('2026-02-10T12:00:00.000Z'),
    new Date('2026-02-10T12:00:00.000Z'),
  ),
  new Review(
    `review-${tourId}-2`,
    SEED_IDS.people.admin,
    tourId,
    'Marta Admin',
    'Administrator',
    'https://i.pravatar.cc/300?u=admin@tourex.test',
    'A strong route for travelers who want clear logistics and varied stops without a rushed schedule.',
    {
      location: 5,
      amenities: 4,
      services: 5,
      price: 5,
      rooms: 4,
    },
    new Date('2026-02-12T12:00:00.000Z'),
    new Date('2026-02-12T12:00:00.000Z'),
  ),
];

interface TourSeed {
  id: string;
  kind: TourKind;
  title: string;
  slug: string;
  destination: Destination;
  basePrice: number;
  durationDays: number;
  groupSize: number;
  typeLabel: string;
  transportMode: TourTransportMode;
  ribbonLabel: string | null;
  seasonName?: string;
  seasonMultiplier?: number;
  premiumMultiplier?: number;
}

const tour = ({
  id,
  kind,
  title,
  slug,
  destination: tourDestination,
  basePrice,
  durationDays,
  groupSize,
  typeLabel,
  transportMode,
  ribbonLabel,
  seasonName,
  seasonMultiplier,
  premiumMultiplier,
}: TourSeed): Tour => {
  const props = {
    id,
    title,
    slug,
    summary: `A balanced ${durationDays}-day route through ${tourDestination.getLabel()} with guided stops, local context and practical pacing.`,
    heroImage: tourDestination.getHeroImage(),
    cardImage: tourDestination.getImage(),
    gallery: [
      tourDestination.getImage(),
      tourDestination.getHeroImage(),
      '/assets/hero-slider/slide-3.jpg',
      '/assets/decor/hero-conflict-islands.jpg',
    ],
    destination: tourDestination,
    basePrice,
    locationNote: tourDestination.getLabel(),
    durationDays,
    transportMode,
    groupSize,
    typeLabel,
    languages: ['English', 'Spanish', 'Ukrainian'].slice(0, kind === 'premium' ? 3 : 2),
    amenities: ['Hotel pickup', 'Local guide', 'Breakfast', 'Insurance'].slice(
      0,
      kind === 'standard' ? 2 : 4,
    ),
    highlightItems: [
      'Guided route planning',
      'Small-group pacing',
      'Local food and culture stops',
    ],
    includedItems: ['Guide', 'Route support', 'Selected transfers'],
    excludedItems: ['International flights', 'Personal shopping', 'Optional tips'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and orientation',
        description: `Meet the guide, review the route and settle into ${tourDestination.getCity()}.`,
      },
      {
        day: 2,
        title: 'Main route',
        description: 'Visit the strongest cultural and scenic stops with time for breaks.',
      },
      {
        day: 3,
        title: 'Flexible departure',
        description: 'Close the trip with a slower morning and optional local recommendations.',
      },
    ],
    reviews: reviews(id),
    ribbonLabel,
    createdAt,
    updatedAt: createdAt,
  };

  switch (kind) {
    case 'featured':
      return new FeaturedTour(props);
    case 'seasonal':
      return new SeasonalTour(props, seasonName ?? 'Seasonal', seasonMultiplier ?? 0.86);
    case 'premium':
      return new PremiumTour(props, premiumMultiplier ?? 1.16);
    default:
      return new Tour(props);
  }
};

export const createSeedTours = (): Tour[] => [
  tour({
    id: SEED_IDS.tours.maldives,
    kind: 'featured',
    title: 'Maldives Island Escape',
    slug: 'maldives-island-escape',
    destination: destinations.maldives,
    basePrice: 520,
    durationDays: 5,
    groupSize: 10,
    typeLabel: 'Island',
    transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  }),
  tour({
    id: SEED_IDS.tours.paris,
    kind: 'standard',
    title: 'Paris Culture Weekend',
    slug: 'paris-culture-weekend',
    destination: destinations.paris,
    basePrice: 360,
    durationDays: 3,
    groupSize: 12,
    typeLabel: 'Culture',
    transportMode: 'busTour',
    ribbonLabel: null,
  }),
  tour({
    id: SEED_IDS.tours.tokyo,
    kind: 'premium',
    title: 'Tokyo Private Lights',
    slug: 'tokyo-private-lights',
    destination: destinations.tokyo,
    basePrice: 640,
    durationDays: 4,
    groupSize: 6,
    typeLabel: 'Private',
    transportMode: 'flightIncluded',
    ribbonLabel: 'Private',
    premiumMultiplier: 1.12,
  }),
  tour({
    id: SEED_IDS.tours.cairo,
    kind: 'seasonal',
    title: 'Cairo Heritage Route',
    slug: 'cairo-heritage-route',
    destination: destinations.cairo,
    basePrice: 420,
    durationDays: 4,
    groupSize: 14,
    typeLabel: 'Heritage',
    transportMode: 'busTour',
    ribbonLabel: 'Spring',
    seasonName: 'Spring',
    seasonMultiplier: 0.84,
  }),
  tour({
    id: SEED_IDS.tours.bali,
    kind: 'featured',
    title: 'Bali Wellness Coast',
    slug: 'bali-wellness-coast',
    destination: destinations.bali,
    basePrice: 470,
    durationDays: 6,
    groupSize: 9,
    typeLabel: 'Wellness',
    transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  }),
  tour({
    id: SEED_IDS.tours.peru,
    kind: 'standard',
    title: 'Peru Andes Trail',
    slug: 'peru-andes-trail',
    destination: destinations.peru,
    basePrice: 550,
    durationDays: 7,
    groupSize: 8,
    typeLabel: 'Adventure',
    transportMode: 'busTour',
    ribbonLabel: null,
  }),
  tour({
    id: SEED_IDS.tours.norway,
    kind: 'seasonal',
    title: 'Norway Fjord Cruise',
    slug: 'norway-fjord-cruise',
    destination: destinations.norway,
    basePrice: 690,
    durationDays: 5,
    groupSize: 16,
    typeLabel: 'Cruise',
    transportMode: 'cruise',
    ribbonLabel: 'Summer',
    seasonName: 'Summer',
    seasonMultiplier: 0.88,
  }),
  tour({
    id: SEED_IDS.tours.greece,
    kind: 'premium',
    title: 'Santorini Concierge Stay',
    slug: 'santorini-concierge-stay',
    destination: destinations.greece,
    basePrice: 620,
    durationDays: 5,
    groupSize: 6,
    typeLabel: 'Concierge',
    transportMode: 'cruise',
    ribbonLabel: 'Concierge',
    premiumMultiplier: 1.1,
  }),
];
