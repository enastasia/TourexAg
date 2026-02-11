import { AuthSession, type AuthSessionPrimitives } from '../../domain/auth/AuthSession';

export class SessionRepository {
  private readonly storageKey = 'tourex.session';

  public get(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(this.storageKey);
    return raw ? AuthSession.restore(JSON.parse(raw) as AuthSessionPrimitives) : null;
  }

  public save(session: AuthSession): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      this.storageKey,
      JSON.stringify(session.toPrimitives()),
    );
  }

  public clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }
}
