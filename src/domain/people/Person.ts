import { BaseEntity } from '../shared/BaseEntity';
import type { ValidationError } from '../shared/ValidationError';
import { Email } from '../shared/value-objects/Email';
import { Phone } from '../shared/value-objects/Phone';
import type { PersonRole } from '../../shared/types/domain';

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
  protected email: Email;
  protected phone: Phone;

  protected constructor(
    id: string,
    protected fullName: string,
    email: string,
    phone: string,
    protected avatar: string,
    protected passwordHash: string,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
    this.email = new Email(email);
    this.phone = new Phone(phone);
  }

  public abstract getRole(): PersonRole;

  public abstract getDashboardSections(): string[];

  public getFullName(): string {
    return this.fullName;
  }

  public getEmail(): string {
    return this.email.getValue();
  }

  public getPhone(): string {
    return this.phone.getValue();
  }

  public getAvatar(): string {
    return this.avatar;
  }

  public matchesPasswordHash(passwordHash: string): boolean {
    return this.passwordHash === passwordHash;
  }

  public updateProfile(fullName: string, phone: string, avatar?: string): void {
    this.fullName = fullName.trim();
    this.phone = new Phone(phone);
    if (avatar !== undefined) {
      this.avatar = avatar;
    }
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

    if (!this.email.isValid()) {
      errors.push({
        field: 'email',
        message: 'Provide a valid email address (e.g. user@example.com).',
      });
    }

    if (!this.phone.isValid()) {
      errors.push({
        field: 'phone',
        message: 'Provide a valid phone number with country code (e.g. +380 XX XXX XXXX).',
      });
    }

    return errors;
  }

  public static isValidEmail(email: string): boolean {
    return Email.isValid(email);
  }

  public static isValidPhone(phone: string): boolean {
    return Phone.isValid(phone);
  }
}
