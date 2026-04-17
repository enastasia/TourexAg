import { Cart } from '../../domain/booking/Cart';
import { SEED_IDS } from './seedIds';

export const createSeedCarts = (): Cart[] => [
  new Cart(
    SEED_IDS.carts.traveler,
    SEED_IDS.people.traveler,
    [],
    new Date('2026-01-06T10:00:00.000Z'),
    new Date('2026-01-06T10:00:00.000Z'),
  ),
];
