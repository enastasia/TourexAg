import type { AuthSession } from '../../domain/auth/AuthSession';

export interface ISessionRepository {
  get(): AuthSession | null;
  save(session: AuthSession): void;
  clear(): void;
}
