import { BaseEntity } from '../shared/BaseEntity';
import type { PersonRole } from '../../shared/types/domain';

export interface AuthSessionPrimitives {
  id: string;
  userId: string;
  role: PersonRole;
  createdAt: string;
  updatedAt: string;
}

export class AuthSession extends BaseEntity<AuthSessionPrimitives> {
  public constructor(
    id: string,
    private readonly userId: string,
    private readonly role: PersonRole,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getUserId(): string {
    return this.userId;
  }

  public getRole(): PersonRole {
    return this.role;
  }

  public canAccessAdminArea(): boolean {
    return this.role === 'admin';
  }

  public override toPrimitives(): AuthSessionPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      role: this.role,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: AuthSessionPrimitives): AuthSession {
    return new AuthSession(
      primitives.id,
      primitives.userId,
      primitives.role,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
