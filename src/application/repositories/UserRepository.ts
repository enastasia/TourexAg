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
    super('tourex.people');
  }

  protected deserialize(record: StoredPersonPrimitives): StoredPerson {
    return record.role === 'admin' ? Admin.restore(record) : User.restore(record);
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
}
