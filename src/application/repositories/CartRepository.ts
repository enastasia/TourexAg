import { Cart, type CartPrimitives } from '../../domain/booking/Cart';
import type { User } from '../../domain/people/User';
import { createId } from '../../shared/utils/identity';
import { BrowserStorageRepository } from './BrowserStorageRepository';
import { normalizeCartRecord } from './BookingRequestMigration';

export class CartRepository extends BrowserStorageRepository<Cart, CartPrimitives> {
  public constructor() {
    super('tourex.cart');
  }

  public findByUserId(userId: string): Cart | undefined {
    return this.findOne((cart) => cart.belongsToUser(userId));
  }

  public saveCart(cart: Cart): void {
    this.saveOrReplace(cart, (current) => current.getId() === cart.getId());
  }

  public getOrCreateForUser(user: User): Cart {
    const cart = this.findByUserId(user.getId());

    if (cart) {
      return cart;
    }

    const emptyCart = new Cart(createId('cart'), user.getId());
    this.saveCart(emptyCart);
    return emptyCart;
  }

  protected deserialize(record: CartPrimitives): Cart {
    return Cart.restore(normalizeCartRecord(record));
  }
}
