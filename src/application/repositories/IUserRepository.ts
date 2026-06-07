import type { User } from '../../domain/people/User';
import type { Admin } from '../../domain/people/Admin';

export type StoredPerson = User | Admin;

export interface IUserRepository {
  getAll(): StoredPerson[];
  findById(personId: string): StoredPerson | undefined;
  findByEmail(email: string): StoredPerson | undefined;
  savePerson(person: StoredPerson): void;
  deletePerson(personId: string): void;
  getCustomers(): User[];
}
