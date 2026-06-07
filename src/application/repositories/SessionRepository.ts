import { AuthSession, type AuthSessionPrimitives } from '../../domain/auth/AuthSession';
import type { ISessionRepository } from './ISessionRepository';

export class SessionRepository implements ISessionRepository {
  private readonly storageKey = 'tourex.session';

  public get(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    return AuthSession.restore(JSON.parse(raw) as AuthSessionPrimitives);
  }

  public save(session: AuthSession): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(session.toPrimitives()));
  }

  public clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }
}
