import type { Cart } from '../../domain/booking/Cart';
import type { User } from '../../domain/people/User';

export interface ICartRepository {
  findByUserId(userId: string): Cart | undefined;
  saveCart(cart: Cart): void;
  getOrCreateForUser(user: User): Cart;
}
