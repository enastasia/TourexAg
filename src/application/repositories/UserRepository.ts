import { Cart, type CartPrimitives } from '../../domain/booking/Cart';
import { Admin, type AdminPrimitives } from '../../domain/people/Admin';
import { User, type UserPrimitives } from '../../domain/people/User';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export type StoredPerson = User | Admin;
type StoredPersonPrimitives = UserPrimitives | AdminPrimitives;

export class UserRepository extends BrowserStorageRepository<
  StoredPerson,
  StoredPersonPrimitives
> {
  public constructor() {
    super('tourex.people');
  }

  public findById(personId: string): StoredPerson | undefined {
    return this.getAll().find((person) => person.getId() === personId);
  }

  public findByEmail(email: string): StoredPerson | undefined {
    const normalizedEmail = email.trim().toLowerCase();
    return this.getAll().find((person) => person.getEmail() === normalizedEmail);
  }

  public savePerson(nextPerson: StoredPerson): void {
    const people = this.getAll();
    const index = people.findIndex((person) => person.getId() === nextPerson.getId());

    if (index >= 0) {
      people.splice(index, 1, nextPerson);
    } else {
      people.unshift(nextPerson);
    }

    this.saveAll(people);
  }

  public getCustomers(): User[] {
    return this.getAll().filter((person): person is User => person instanceof User);
  }

  public getLegacyCarts(): Cart[] {
    const legacyCarts: Cart[] = [];

    for (const record of this.readRecords()) {
      const embeddedCart = (record as { cart?: CartPrimitives }).cart;

      if (record.role === 'user' && embeddedCart) {
        legacyCarts.push(Cart.restore(embeddedCart));
      }
    }

    return legacyCarts;
  }

  protected deserialize(record: StoredPersonPrimitives): StoredPerson {
    return record.role === 'admin' ? Admin.restore(record) : User.restore(record);
  }
}
