import { AuthSession } from '../../domain/auth/AuthSession';
import { Cart } from '../../domain/booking/Cart';
import { User } from '../../domain/people/User';
import { Wishlist } from '../../domain/wishlist/Wishlist';
import { createId } from '../../shared/utils/identity';
import { hashPassword } from '../../shared/utils/security';
import { SessionRepository } from '../repositories/SessionRepository';
import {
  UserRepository,
  type StoredPerson,
} from '../repositories/UserRepository';
import { failureResult, successResult, type ServiceResult } from './ServiceResult';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export class AuthService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  public login(payload: LoginPayload): ServiceResult<StoredPerson> {
    const person = this.userRepository.findByEmail(payload.email);

    if (!person || !person.matchesPassword(payload.password)) {
      return failureResult('Invalid email or password.');
    }

    this.sessionRepository.save(
      new AuthSession(createId('session'), person.getId(), person.getRole()),
    );

    return successResult(person);
  }

  public register(payload: RegisterPayload): ServiceResult<User> {
    if (this.userRepository.findByEmail(payload.email)) {
      return failureResult('A user with this email already exists.');
    }

    const userId = createId('user');
    const user = new User(
      userId,
      payload.fullName,
      payload.email.trim().toLowerCase(),
      payload.phone,
      `https://i.pravatar.cc/300?u=${payload.email}`,
      hashPassword(payload.password),
      new Wishlist(createId('wishlist'), userId),
      new Cart(createId('cart'), userId),
    );

    if (!user.isValid()) {
      return failureResult('Provided registration data is not valid.');
    }

    this.userRepository.savePerson(user);
    this.sessionRepository.save(new AuthSession(createId('session'), userId, 'user'));

    return successResult(user);
  }

  public logout(): void {
    this.sessionRepository.clear();
  }

  public getCurrentPerson(): StoredPerson | null {
    const session = this.sessionRepository.get();

    if (!session) {
      return null;
    }

    return this.userRepository.findById(session.getUserId()) ?? null;
  }
}
