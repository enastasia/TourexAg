import { Person, type PersonPrimitives } from './Person';
import type { IAdminManageable } from '../shared/contracts';
import type { PersonRole } from '../../shared/types/domain';

export interface AdminPrimitives extends PersonPrimitives {
  role: 'admin';
  permissions: string[];
}

export class Admin
  extends Person<AdminPrimitives>
  implements IAdminManageable
{
  public constructor(
    id: string,
    fullName: string,
    email: string,
    phone: string,
    avatar: string,
    passwordHash: string,
    private readonly permissions: string[],
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, fullName, email, phone, avatar, passwordHash, createdAt, updatedAt);
  }

  public override getRole(): PersonRole {
    return 'admin';
  }

  public override getDashboardSections(): string[] {
    return ['Overview', 'Catalog', 'Users', 'Reviews', 'Bookings'];
  }

  public getAdminActions(): string[] {
    return [...this.permissions];
  }

  public canBeManagedBy(role: string): boolean {
    return role === 'admin';
  }

  public override toPrimitives(): AdminPrimitives {
    return {
      id: this.id,
      role: 'admin',
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      avatar: this.avatar,
      passwordHash: this.passwordHash,
      permissions: [...this.permissions],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: AdminPrimitives): Admin {
    return new Admin(
      primitives.id,
      primitives.fullName,
      primitives.email,
      primitives.phone,
      primitives.avatar,
      primitives.passwordHash,
      primitives.permissions,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
