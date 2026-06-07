import { AuthSession } from '../../domain/auth/AuthSession';
import { Cart } from '../../domain/booking/Cart';
import { Person } from '../../domain/people/Person';
import { User } from '../../domain/people/User';
import { Wishlist } from '../../domain/wishlist/Wishlist';
import { ValidationException } from '../../domain/shared/exceptions/ValidationException';
import { AuthenticationException } from '../../domain/shared/exceptions/AuthenticationException';
import { createId } from '../../shared/utils/identity';
import { hashPassword } from '../../shared/utils/security';
import type { ICartRepository } from '../repositories/ICartRepository';
import type { ISessionRepository } from '../repositories/ISessionRepository';
import type { IUserRepository, StoredPerson } from '../repositories/IUserRepository';
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
    private readonly userRepository: IUserRepository,
    private readonly cartRepository: ICartRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  public login(payload: LoginPayload): ServiceResult<StoredPerson> {
    try {
      const person = this.authenticate(payload.email, payload.password);
      this.sessionRepository.save(
        new AuthSession(createId('session'), person.getId(), person.getRole()),
      );
      return successResult(person);
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return failureResult(error.message);
      }
      throw error;
    }
  }

  private authenticate(email: string, password: string): StoredPerson {
    const person = this.userRepository.findByEmail(email);

    if (!person) {
      throw new AuthenticationException('No account found with this email address.');
    }

    if (!person.matchesPasswordHash(hashPassword(password))) {
      throw new AuthenticationException('Incorrect password. Please try again.');
    }

    return person;
  }

  public register(payload: RegisterPayload): ServiceResult<User> {
    if (!Person.isValidEmail(payload.email)) {
      return failureResult('Invalid email format. Use format: user@example.com');
    }

    if (!Person.isValidPhone(payload.phone)) {
      return failureResult('Invalid phone number. Use international format: +380 XX XXX XXXX');
    }

    if (this.userRepository.findByEmail(payload.email)) {
      return failureResult('A user with this email already exists.');
    }

    const userId = createId('user');
    const user = new User(
      userId,
      payload.fullName,
      payload.email.trim().toLowerCase(),
      payload.phone,
      '/assets/default-avatar.svg',
      hashPassword(payload.password),
      new Wishlist(createId('wishlist'), userId),
    );

    try {
      user.assertValid();
    } catch (error) {
      if (error instanceof ValidationException) {
        return failureResult(error.errors[0]?.message ?? 'Provided registration data is not valid.');
      }
      throw error;
    }

    this.userRepository.savePerson(user);
    this.cartRepository.saveCart(new Cart(createId('cart'), userId));
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
