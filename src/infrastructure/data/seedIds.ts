export const USER_IDS = {
  admin: 'admin-main',
  primaryTraveler: 'user-traveler-anna',
  secondaryTraveler: 'user-traveler-ethan',
} as const;

export const SEED_CREDENTIALS = {
  admin: {
    email: 'admin@tourex.dev',
    password: 'Admin123!',
  },
  traveler: {
    email: 'anna@tourex.dev',
    password: 'Traveler123!',
  },
  travelerTwo: {
    email: 'ethan@tourex.dev',
    password: 'Traveler123!',
  },
} as const;
