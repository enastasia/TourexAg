import { Admin, type AdminPrimitives } from '../../domain/people/Admin';
import { User, type UserPrimitives } from '../../domain/people/User';
import { BrowserStorageRepository } from './BrowserStorageRepository';

export type StoredPerson = User | Admin;
export type StoredPersonPrimitives = UserPrimitives | AdminPrimitives;

export class UserRepository extends BrowserStorageRepository<
  StoredPerson,
  StoredPersonPrimitives
> {
  public constructor() {
    super('tourex.users');
  }

  protected deserialize(record: StoredPersonPrimitives): StoredPerson {
    return record.role === 'admin' ? Admin.restore(record) : User.restore(record);
  }

  public findById(userId: string): StoredPerson | undefined {
    return this.getAll().find((person) => person.getId() === userId);
  }

  public findByEmail(email: string): StoredPerson | undefined {
    return this.getAll().find(
      (person) => person.getEmail().toLowerCase() === email.trim().toLowerCase(),
    );
  }

  public getCustomers(): User[] {
    return this.getAll().filter((person): person is User => person instanceof User);
  }

  public savePerson(person: StoredPerson): void {
    const people = this.getAll();
    const index = people.findIndex((current) => current.getId() === person.getId());

    if (index >= 0) {
      people.splice(index, 1, person);
    } else {
      people.unshift(person);
    }

    this.saveAll(people);
  }
}
