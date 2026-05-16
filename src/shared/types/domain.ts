export type PersonRole = 'user' | 'admin';

export type TourKind = 'standard' | 'featured' | 'seasonal' | 'premium';

export type TourTransportMode = 'flightIncluded' | 'busTour' | 'cruise';

export type BookingStatus = 'draft' | 'confirmed' | 'cancelled';

export type TourSortMode =
  | 'default'
  | 'priceAsc'
  | 'priceDesc'
  | 'ratingDesc'
  | 'durationAsc';

export type TimeSlot = '12:00' | '19:00';
