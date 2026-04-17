import { Admin } from '../../domain/people/Admin';
import { User } from '../../domain/people/User';
import { failureResult, successResult, type ServiceResult } from './ServiceResult';
import type { StoredPerson } from '../repositories/UserRepository';

export class AuthGuard {
  public requireUser(
    person: StoredPerson | null,
    error: string,
  ): ServiceResult<User> {
    return person instanceof User ? successResult(person) : failureResult(error);
  }

  public requireAdmin(
    person: StoredPerson | null,
    error: string,
  ): ServiceResult<Admin> {
    return person instanceof Admin ? successResult(person) : failureResult(error);
  }
}
