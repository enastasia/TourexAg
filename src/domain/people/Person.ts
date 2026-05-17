import { BaseEntity } from '../shared/BaseEntity';
import type { ValidationError } from '../shared/ValidationError';
import type { PersonRole } from '../../shared/types/domain';
import { hashPassword } from '../../shared/utils/security';

export interface PersonPrimitives {
  id: string;
  role: PersonRole;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export abstract class Person<
  TPrimitives extends PersonPrimitives,
> extends BaseEntity<TPrimitives> {
  protected constructor(
    id: string,
    protected fullName: string,
    protected email: string,
    protected phone: string,
    protected avatar: string,
    protected passwordHash: string,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public abstract getRole(): PersonRole;

  public abstract getDashboardSections(): string[];

  public getFullName(): string {
    return this.fullName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getAvatar(): string {
    return this.avatar;
  }

  public matchesPassword(value: string): boolean {
    return this.passwordHash === hashPassword(value);
  }

  public updateProfile(fullName: string, phone: string): void {
    this.fullName = fullName.trim();
    this.phone = phone.trim();
    this.touch();
  }

  public override validate(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (this.fullName.trim().length < 3) {
      errors.push({
        field: 'fullName',
        message: 'Full name must contain at least 3 characters.',
      });
    }

    if (!this.email.includes('@')) {
      errors.push({
        field: 'email',
        message: 'Provide a valid email address.',
      });
    }

    if (this.phone.trim().length < 6) {
      errors.push({
        field: 'phone',
        message: 'Provide a valid phone number.',
      });
    }

    return errors;
  }
}
