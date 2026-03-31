import { Cart } from '../../domain/booking/Cart';
import { Admin } from '../../domain/people/Admin';
import { User } from '../../domain/people/User';
import { Wishlist } from '../../domain/wishlist/Wishlist';
import { USER_IDS, SEED_CREDENTIALS } from './seedIds';
import { hashPassword } from '../../shared/utils/security';

const seedDate = new Date('2026-03-29T08:00:00.000Z');

export const createSeedUsers = (): Array<User | Admin> => [
  new Admin(
    USER_IDS.admin,
    'Ariana Cole',
    SEED_CREDENTIALS.admin.email,
    '+123 5959 66',
    'https://i.pravatar.cc/300?img=32',
    hashPassword(SEED_CREDENTIALS.admin.password),
    ['catalog:create', 'catalog:update', 'catalog:delete', 'users:view', 'reviews:view'],
    seedDate,
    seedDate,
  ),
  new User(
    USER_IDS.primaryTraveler,
    'Anna Peterson',
    SEED_CREDENTIALS.traveler.email,
    '+1 889 009 201',
    'https://i.pravatar.cc/300?img=45',
    hashPassword(SEED_CREDENTIALS.traveler.password),
    new Wishlist('wishlist-anna', USER_IDS.primaryTraveler, [], seedDate, seedDate),
    new Cart('cart-anna', USER_IDS.primaryTraveler, [], seedDate, seedDate),
    seedDate,
    seedDate,
  ),
  new User(
    USER_IDS.secondaryTraveler,
    'Ethan Brooks',
    SEED_CREDENTIALS.travelerTwo.email,
    '+1 889 009 301',
    'https://i.pravatar.cc/300?img=13',
    hashPassword(SEED_CREDENTIALS.travelerTwo.password),
    new Wishlist('wishlist-ethan', USER_IDS.secondaryTraveler, [], seedDate, seedDate),
    new Cart('cart-ethan', USER_IDS.secondaryTraveler, [], seedDate, seedDate),
    seedDate,
    seedDate,
  ),
];
