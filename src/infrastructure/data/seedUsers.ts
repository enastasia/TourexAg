import { Admin } from '../../domain/people/Admin';
import { User } from '../../domain/people/User';
import { Wishlist } from '../../domain/wishlist/Wishlist';
import { hashPassword } from '../../shared/utils/security';
import { SEED_CREDENTIALS, SEED_IDS } from './seedIds';

export const createSeedUsers = (): Array<User | Admin> => [
  new User(
    SEED_IDS.people.traveler,
    'Daniel Kross',
    SEED_CREDENTIALS.traveler.email,
    '+1 202 555 0148',
    '/assets/avatars/avatar-traveler.jpg',
    hashPassword(SEED_CREDENTIALS.traveler.password),
    new Wishlist(SEED_IDS.wishlists.traveler, SEED_IDS.people.traveler, [
      SEED_IDS.tours.maldives,
      SEED_IDS.tours.paris,
    ]),
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
  new Admin(
    SEED_IDS.people.admin,
    'Marcus Reed',
    SEED_CREDENTIALS.admin.email,
    '+1 202 555 0199',
    '/assets/avatars/avatar-admin.jpg',
    hashPassword(SEED_CREDENTIALS.admin.password),
    ['Catalog management', 'Booking review', 'Customer support'],
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
];
