import { Admin, type AdminPrimitives } from '../../domain/people/Admin';
import { Cart, type CartPrimitives } from '../../domain/booking/Cart';
import { User, type UserPrimitives } from '../../domain/people/User';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export type StoredPerson = User | Admin;
export type StoredPersonPrimitives = UserPrimitives | AdminPrimitives;

type LegacyUserPrimitives = Omit<UserPrimitives, 'cartId'> & {
  cart?: CartPrimitives;
  cartId?: string;
};

type StoredPersonStorageRecord = AdminPrimitives | UserPrimitives | LegacyUserPrimitives;

export class UserRepository extends BrowserStorageRepository<
  StoredPerson,
  StoredPersonStorageRecord
> {
  public constructor() {
    super('tourex.people');
  }

  protected deserialize(record: StoredPersonStorageRecord): StoredPerson {
    return record.role === 'admin'
      ? Admin.restore(record)
      : User.restore(this.normalizeUserRecord(record));
  }

  public getLegacyCarts(): Cart[] {
    return this.readRecords().flatMap((record) => {
      if (record.role === 'admin') {
        return [];
      }

      const cart = this.restoreLegacyCart(record);
      return cart ? [cart] : [];
    });
  }

  public findById(personId: string): StoredPerson | undefined {
    return this.findOne((person) => person.getId() === personId);
  }

  public findByEmail(email: string): StoredPerson | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.getAll().find(
      (person) => person.getEmail().toLowerCase() === normalizedEmail,
    );
  }

  public savePerson(person: StoredPerson): void {
    this.saveOrReplace(person, (current) => current.getId() === person.getId());
  }

  public getCustomers(): User[] {
    return this.getAll().filter((person): person is User => person instanceof User);
  }

  private normalizeUserRecord(record: UserPrimitives | LegacyUserPrimitives): UserPrimitives {
    const legacyCartId = 'cart' in record ? record.cart?.id : undefined;

    return {
      ...record,
      cartId: record.cartId ?? legacyCartId ?? `cart_${record.id}`,
    };
  }

  private restoreLegacyCart(record: UserPrimitives | LegacyUserPrimitives): Cart | null {
    return 'cart' in record && record.cart ? Cart.restore(record.cart) : null;
  }
}
