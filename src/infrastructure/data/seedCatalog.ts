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
  dubai: destination(
    SEED_IDS.destinations.dubai,
    'Dubai',
    'Emirates',
    '/assets/hero-slider/slide-1.jpg',
    25.2048,
    55.2708,
  ),
  rome: destination(
    SEED_IDS.destinations.rome,
    'Rome City',
    'Italy',
    '/assets/decor/decor-eiffel.webp',
    41.9028,
    12.4964,
  ),
  barcelona: destination(
    SEED_IDS.destinations.barcelona,
    'Barcelona',
    'Spain',
    '/assets/hero-slider/slide-2.jpg',
    41.3874,
    2.1686,
  ),
  sydney: destination(
    SEED_IDS.destinations.sydney,
    'Sydney',
    'Australia',
    '/assets/hero-slider/slide-3.jpg',
    -33.8688,
    151.2093,
  ),
  newYork: destination(
    SEED_IDS.destinations.newYork,
    'New York',
    'USA',
    '/assets/decor/decor-map-americas.webp',
    40.7128,
    -74.006,
  ),
  switzerland: destination(
    SEED_IDS.destinations.switzerland,
    'Zurich',
    'Switzerland',
    '/assets/hero-slider/slide-4.jpg',
    47.3769,
    8.5417,
  ),
  cappadocia: destination(
    SEED_IDS.destinations.cappadocia,
    'Cappadocia',
    'Turkey',
    '/assets/hero-slider/slide-5.jpg',
    38.6431,
    34.8289,
  ),
  kyoto: destination(
    SEED_IDS.destinations.kyoto,
    'Kyoto',
    'Japan',
    '/assets/decor/decor-map-asia.webp',
    35.0116,
    135.7681,
  ),
  morocco: destination(
    SEED_IDS.destinations.morocco,
    'Marrakech',
    'Morocco',
    '/assets/decor/decor-pyramids.webp',
    31.6295,
    -7.9811,
  ),
  iceland: destination(
    SEED_IDS.destinations.iceland,
    'Reykjavik',
    'Iceland',
    '/assets/hero-slider/slide-4.jpg',
    64.1466,
    -21.9426,
  ),
  lisbon: destination(
    SEED_IDS.destinations.lisbon,
    'Lisbon',
    'Portugal',
    '/assets/hero-slider/slide-3.jpg',
    38.7223,
    -9.1393,
  ),
  vienna: destination(
    SEED_IDS.destinations.vienna,
    'Vienna',
    'Austria',
    '/assets/hero-slider/slide-5.jpg',
    48.2082,
    16.3738,
  ),
  bangkok: destination(
    SEED_IDS.destinations.bangkok,
    'Bangkok',
    'Thailand',
    '/assets/hero-slider/slide-2.jpg',
    13.7563,
    100.5018,
  ),
  athens: destination(
    SEED_IDS.destinations.athens,
    'Athens',
    'Greece',
    '/assets/hero-slider/slide-1.jpg',
    37.9838,
    23.7275,
  ),
  havana: destination(
    SEED_IDS.destinations.havana,
    'Havana',
    'Cuba',
    '/assets/decor/decor-map-americas.webp',
    23.1136,
    -82.3666,
  ),
  capeTown: destination(
    SEED_IDS.destinations.capeTown,
    'Cape Town',
    'South Africa',
    '/assets/hero-slider/slide-4.jpg',
    -33.9249,
    18.4241,
  ),
};

const reviewerPool = [
  { name: 'Andrei Black', role: 'Verified Traveller', avatar: '/assets/avatars/avatar-reviewer-01.jpg' },
  { name: 'Nathan Cole', role: 'Verified Traveller', avatar: '/assets/avatars/avatar-reviewer-02.jpg' },
  { name: 'Viktor Strand', role: 'Adventure Seeker', avatar: '/assets/avatars/avatar-reviewer-03.jpg' },
  { name: 'Thomas Hale', role: 'Frequent Traveller', avatar: '/assets/avatars/avatar-reviewer-04.jpg' },
  { name: 'Erik Lund', role: 'Verified Traveller', avatar: '/assets/avatars/avatar-reviewer-05.jpg' },
  { name: 'James Walker', role: 'Explorer', avatar: '/assets/avatars/avatar-reviewer-06.jpg' },
  { name: 'Ronald Richards', role: 'Frequent Traveller', avatar: '/assets/avatars/avatar-reviewer-07.jpg' },
  { name: 'Oscar Bennett', role: 'Adventure Seeker', avatar: '/assets/avatars/avatar-reviewer-08.jpg' },
  { name: 'Leo Martinez', role: 'Verified Traveller', avatar: '/assets/avatars/avatar-reviewer-09.jpg' },
  { name: 'Ryan Foster', role: 'Explorer', avatar: '/assets/avatars/avatar-reviewer-10.jpg' },
  { name: 'Miles Cooper', role: 'Frequent Traveller', avatar: '/assets/avatars/avatar-reviewer-11.jpg' },
  { name: 'Daniel Kross', role: 'Verified Traveller', avatar: '/assets/avatars/avatar-traveler.jpg' },
  { name: 'Marcus Reed', role: 'Administrator', avatar: '/assets/avatars/avatar-admin.jpg' },
] as const;

const reviewMessages = [
  'The itinerary was paced well, the guide was clear, and the route felt easy to follow.',
  'A strong route for travelers who want clear logistics and varied stops without a rushed schedule.',
  'A very polished trip overall. The timing worked, the stops were meaningful and the quality of the experience matched the price.',
  'Great for travellers who want structure without feeling rushed. Transfers, guide support and the main stops were all handled very well.',
  'The route felt well paced, the guide was sharp and the whole day stayed organised without losing the sense of discovery.',
  'Solid planning from start to finish. The group size was comfortable and the destinations were well chosen for the season.',
  'Castle in one day is next to impossible. This tour keeps the pace strong, the logistics easy and the whole experience very coherent.',
  'Everything ran on time. The guide knew the area well and adapted to our group without cutting any highlights.',
] as const;

const reviewScoreVariants = [
  { location: 5, amenities: 5, services: 5, price: 4, rooms: 5 },
  { location: 5, amenities: 4, services: 5, price: 5, rooms: 4 },
  { location: 4, amenities: 4, services: 5, price: 4, rooms: 5 },
  { location: 5, amenities: 5, services: 4, price: 5, rooms: 5 },
  { location: 5, amenities: 4, services: 5, price: 4, rooms: 5 },
  { location: 4, amenities: 5, services: 5, price: 5, rooms: 4 },
  { location: 5, amenities: 5, services: 5, price: 5, rooms: 4 },
  { location: 5, amenities: 4, services: 4, price: 5, rooms: 5 },
];

const reviews = (tourId: string, tourIndex: number) => {
  const r1 = reviewerPool[(tourIndex * 2) % reviewerPool.length];
  const r2 = reviewerPool[(tourIndex * 2 + 1) % reviewerPool.length];

  return [
    new Review(
      `review-${tourId}-1`,
      SEED_IDS.people.traveler,
      tourId,
      r1.name,
      r1.role,
      r1.avatar,
      reviewMessages[tourIndex % reviewMessages.length],
      reviewScoreVariants[tourIndex % reviewScoreVariants.length],
      new Date('2026-02-10T12:00:00.000Z'),
      new Date('2026-02-10T12:00:00.000Z'),
    ),
    new Review(
      `review-${tourId}-2`,
      SEED_IDS.people.admin,
      tourId,
      r2.name,
      r2.role,
      r2.avatar,
      reviewMessages[(tourIndex + 1) % reviewMessages.length],
      reviewScoreVariants[(tourIndex + 1) % reviewScoreVariants.length],
      new Date('2026-02-12T12:00:00.000Z'),
      new Date('2026-02-12T12:00:00.000Z'),
    ),
  ];
};

const EXTRA_LANGUAGES = ['Spanish', 'French', 'German', 'Italian', 'Japanese', 'Portuguese', 'Chinese'];

const pickLanguages = (tourIndex: number, kind: TourKind): string[] => {
  const primary = EXTRA_LANGUAGES[tourIndex % EXTRA_LANGUAGES.length];
  if (kind === 'premium') {
    const secondary = EXTRA_LANGUAGES[(tourIndex + 3) % EXTRA_LANGUAGES.length];
    return ['English', primary, ...(secondary !== primary ? [secondary] : [])];
  }
  return ['English', primary];
};

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

const TOUR_HERO_IMAGE = '/assets/tours/detail-hero.jpg';

const SHARED_GALLERY = [
  '/assets/tour-details/shared-gallery-main.jpg',
  '/assets/tour-details/shared-gallery-top-right.jpg',
  '/assets/tour-details/shared-gallery-bottom-left.jpg',
  '/assets/tour-details/shared-gallery-bottom-right.jpg',
];

const TOUR_CARD_IMAGES: Record<number, string> = {
  0: '/assets/tours/tour-card-01.jpg',
  1: '/assets/tours/tour-card-02.jpg',
  2: '/assets/tours/tour-card-03.jpg',
  3: '/assets/tours/tour-card-04.jpg',
  4: '/assets/tours/tour-card-05.jpg',
  5: '/assets/tours/tour-card-06.jpg',
  6: '/assets/tours/tour-card-07.jpg',
  7: '/assets/tours/tour-card-08.jpg',
  8: '/assets/tours/tour-card-09.jpg',
  9: '/assets/tours/tour-card-10.jpg',
  10: '/assets/tours/tour-card-11.jpg',
  11: '/assets/tours/tour-card-12.jpg',
};

/* ── Custom images uploaded via admin panel and persisted as static files ── */
const CUSTOM_IMAGES: Record<string, {
  cardImage?: string;
  heroImage?: string;
  gallery?: Record<number, string>;
}> = {
  [SEED_IDS.tours.paris]: {
    cardImage: '/assets/tours/custom/tour_paris_culture--cardImage.jpg',
    heroImage: '/assets/tours/custom/tour_paris_culture--heroImage.jpg',
    gallery: { 0: '/assets/tours/custom/tour_paris_culture--gallery_0.jpg' },
  },
  [SEED_IDS.tours.cairo]: {
    cardImage: '/assets/tours/custom/tour_cairo_heritage--cardImage.jpg',
    heroImage: '/assets/tours/custom/tour_cairo_heritage--heroImage.jpg',
    gallery: { 0: '/assets/tours/custom/tour_cairo_heritage--gallery_0.jpg' },
  },
  [SEED_IDS.tours.peru]: {
    cardImage: '/assets/tours/custom/tour_peru_andes--cardImage.jpg',
  },
  [SEED_IDS.tours.norway]: {
    cardImage: '/assets/tours/custom/tour_norway_fjords--cardImage.jpg',
  },
  [SEED_IDS.tours.greece]: {
    cardImage: '/assets/tours/custom/tour_greece_islands--cardImage.jpg',
  },
  [SEED_IDS.tours.dubai]: {
    cardImage: '/assets/tours/custom/tour_dubai_marina--cardImage.jpg',
  },
  [SEED_IDS.tours.rome]: {
    cardImage: '/assets/tours/custom/tour_rome_passage--cardImage.jpg',
  },
  [SEED_IDS.tours.barcelona]: {
    cardImage: '/assets/tours/custom/tour_barcelona_gaudi--cardImage.jpg',
  },
  [SEED_IDS.tours.sydney]: {
    cardImage: '/assets/tours/custom/tour_sydney_harbour--cardImage.jpg',
  },
};

const tour = (seed: TourSeed, index: number): Tour => {
  const {
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
  } = seed;
  const custom = CUSTOM_IMAGES[id];
  const baseGallery = [...SHARED_GALLERY];
  if (custom?.gallery) {
    for (const [idx, img] of Object.entries(custom.gallery)) {
      baseGallery[Number(idx)] = img;
    }
  }

  const props = {
    id,
    title,
    slug,
    summary: `A balanced ${durationDays}-day route through ${tourDestination.getLabel()} with guided stops, local context and practical pacing.`,
    heroImage: custom?.heroImage ?? TOUR_HERO_IMAGE,
    cardImage: custom?.cardImage ?? TOUR_CARD_IMAGES[index] ?? tourDestination.getImage(),
    gallery: baseGallery,
    destination: tourDestination,
    basePrice,
    locationNote: tourDestination.getLabel(),
    durationDays,
    transportMode,
    groupSize,
    typeLabel,
    languages: pickLanguages(index, kind),
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
    reviews: reviews(id, index),
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

const tourSeeds: TourSeed[] = [
  {
    id: SEED_IDS.tours.maldives, kind: 'featured', title: 'Maldives Island Escape',
    slug: 'maldives-island-escape', destination: destinations.maldives, basePrice: 520,
    durationDays: 5, groupSize: 10, typeLabel: 'Island', transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.paris, kind: 'standard', title: 'Paris Culture Weekend',
    slug: 'paris-culture-weekend', destination: destinations.paris, basePrice: 360,
    durationDays: 3, groupSize: 12, typeLabel: 'Culture', transportMode: 'busTour',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.tokyo, kind: 'premium', title: 'Tokyo Private Lights',
    slug: 'tokyo-private-lights', destination: destinations.tokyo, basePrice: 640,
    durationDays: 4, groupSize: 6, typeLabel: 'Private', transportMode: 'flightIncluded',
    ribbonLabel: 'Premium', premiumMultiplier: 1.12,
  },
  {
    id: SEED_IDS.tours.cairo, kind: 'seasonal', title: 'Cairo Heritage Route',
    slug: 'cairo-heritage-route', destination: destinations.cairo, basePrice: 420,
    durationDays: 4, groupSize: 14, typeLabel: 'Heritage', transportMode: 'busTour',
    ribbonLabel: 'Seasonal', seasonName: 'Spring', seasonMultiplier: 0.84,
  },
  {
    id: SEED_IDS.tours.bali, kind: 'featured', title: 'Bali Wellness Coast',
    slug: 'bali-wellness-coast', destination: destinations.bali, basePrice: 470,
    durationDays: 6, groupSize: 9, typeLabel: 'Wellness', transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.peru, kind: 'standard', title: 'Peru Andes Trail',
    slug: 'peru-andes-trail', destination: destinations.peru, basePrice: 550,
    durationDays: 7, groupSize: 8, typeLabel: 'Adventure', transportMode: 'busTour',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.norway, kind: 'seasonal', title: 'Norway Fjord Cruise',
    slug: 'norway-fjord-cruise', destination: destinations.norway, basePrice: 690,
    durationDays: 5, groupSize: 16, typeLabel: 'Cruise', transportMode: 'cruise',
    ribbonLabel: 'Seasonal', seasonName: 'Summer', seasonMultiplier: 0.88,
  },
  {
    id: SEED_IDS.tours.greece, kind: 'premium', title: 'Santorini Concierge Stay',
    slug: 'santorini-concierge-stay', destination: destinations.greece, basePrice: 620,
    durationDays: 5, groupSize: 6, typeLabel: 'Concierge', transportMode: 'cruise',
    ribbonLabel: 'Premium', premiumMultiplier: 1.1,
  },
  {
    id: SEED_IDS.tours.dubai, kind: 'featured', title: 'Dubai Marina Horizon Weekend',
    slug: 'dubai-marina-horizon', destination: destinations.dubai, basePrice: 580,
    durationDays: 4, groupSize: 8, typeLabel: 'Luxury', transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.rome, kind: 'standard', title: 'Two Hour Walking Tour Of Manhattan',
    slug: 'rome-dawn-courtyard', destination: destinations.rome, basePrice: 320,
    durationDays: 7, groupSize: 15, typeLabel: 'Culture', transportMode: 'busTour',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.barcelona, kind: 'seasonal', title: 'Barcelona Gaudi And Coastline Days',
    slug: 'barcelona-gaudi-coastline', destination: destinations.barcelona, basePrice: 410,
    durationDays: 4, groupSize: 12, typeLabel: 'Architecture', transportMode: 'busTour',
    ribbonLabel: 'Seasonal', seasonName: 'Autumn', seasonMultiplier: 0.82,
  },
  {
    id: SEED_IDS.tours.sydney, kind: 'standard', title: 'Win Cities On Opposite Sides Of The',
    slug: 'sydney-harbour-sunlit', destination: destinations.sydney, basePrice: 450,
    durationDays: 4, groupSize: 10, typeLabel: 'Coastal', transportMode: 'cruise',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.newYork, kind: 'premium', title: 'New York Rooftops And River Nights',
    slug: 'newyork-rooftops-river', destination: destinations.newYork, basePrice: 720,
    durationDays: 5, groupSize: 6, typeLabel: 'Urban', transportMode: 'flightIncluded',
    ribbonLabel: 'Premium', premiumMultiplier: 1.18,
  },
  {
    id: SEED_IDS.tours.switzerland, kind: 'seasonal', title: 'Swiss Peaks Scenic Blueprint',
    slug: 'swiss-peaks-scenic', destination: destinations.switzerland, basePrice: 590,
    durationDays: 6, groupSize: 10, typeLabel: 'Alpine', transportMode: 'busTour',
    ribbonLabel: 'Seasonal', seasonName: 'Winter', seasonMultiplier: 0.9,
  },
  {
    id: SEED_IDS.tours.cappadocia, kind: 'featured', title: 'Cappadocia Sunrise Balloon Week',
    slug: 'cappadocia-sunrise-balloon', destination: destinations.cappadocia, basePrice: 480,
    durationDays: 4, groupSize: 12, typeLabel: 'Adventure', transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.kyoto, kind: 'standard', title: 'Kyoto Riverside Tea Route',
    slug: 'kyoto-riverside-tea', destination: destinations.kyoto, basePrice: 390,
    durationDays: 4, groupSize: 8, typeLabel: 'Tradition', transportMode: 'busTour',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.morocco, kind: 'premium', title: 'Marrakech Desert Nights',
    slug: 'marrakech-desert-nights', destination: destinations.morocco, basePrice: 510,
    durationDays: 5, groupSize: 6, typeLabel: 'Desert', transportMode: 'busTour',
    ribbonLabel: 'Premium', premiumMultiplier: 1.14,
  },
  {
    id: SEED_IDS.tours.iceland, kind: 'seasonal', title: 'Iceland Aurora And Glacier Trail',
    slug: 'iceland-aurora-glacier', destination: destinations.iceland, basePrice: 650,
    durationDays: 6, groupSize: 8, typeLabel: 'Expedition', transportMode: 'flightIncluded',
    ribbonLabel: 'Seasonal', seasonName: 'Winter', seasonMultiplier: 0.86,
  },
  {
    id: SEED_IDS.tours.lisbon, kind: 'standard', title: 'Lisbon Tram And Tile Discovery',
    slug: 'lisbon-tram-tile', destination: destinations.lisbon, basePrice: 340,
    durationDays: 3, groupSize: 14, typeLabel: 'Culture', transportMode: 'busTour',
    ribbonLabel: null,
  },
  {
    id: SEED_IDS.tours.vienna, kind: 'featured', title: 'Vienna Imperial Palaces Tour',
    slug: 'vienna-imperial-palaces', destination: destinations.vienna, basePrice: 460,
    durationDays: 4, groupSize: 10, typeLabel: 'Heritage', transportMode: 'busTour',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.bangkok, kind: 'seasonal', title: 'Bangkok Temples And Street Food',
    slug: 'bangkok-temples-street-food', destination: destinations.bangkok, basePrice: 380,
    durationDays: 5, groupSize: 12, typeLabel: 'Culture', transportMode: 'flightIncluded',
    ribbonLabel: 'Seasonal', seasonName: 'Monsoon', seasonMultiplier: 0.78,
  },
  {
    id: SEED_IDS.tours.athens, kind: 'premium', title: 'Athens Acropolis And Islands',
    slug: 'athens-acropolis-islands', destination: destinations.athens, basePrice: 580,
    durationDays: 6, groupSize: 6, typeLabel: 'Heritage', transportMode: 'cruise',
    ribbonLabel: 'Premium', premiumMultiplier: 1.15,
  },
  {
    id: SEED_IDS.tours.havana, kind: 'featured', title: 'Havana Vintage Car And Salsa Nights',
    slug: 'havana-vintage-salsa', destination: destinations.havana, basePrice: 490,
    durationDays: 5, groupSize: 10, typeLabel: 'Culture', transportMode: 'flightIncluded',
    ribbonLabel: 'Featured',
  },
  {
    id: SEED_IDS.tours.capeTown, kind: 'standard', title: 'Cape Town Coast And Safari Drive',
    slug: 'cape-town-coast-safari', destination: destinations.capeTown, basePrice: 530,
    durationDays: 7, groupSize: 8, typeLabel: 'Safari', transportMode: 'flightIncluded',
    ribbonLabel: null,
  },
];

export const createSeedTours = (): Tour[] =>
  tourSeeds.map((seed, index) => tour(seed, index));
