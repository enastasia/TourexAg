import type { ISerializable, IValidatable } from './contracts';
import { ValidationException } from './exceptions/ValidationException';
import type { ValidationError } from './ValidationError';

export abstract class BaseEntity<TPrimitives>
  implements ISerializable<TPrimitives>, IValidatable
{
  protected constructor(
    protected readonly id: string,
    protected createdAt: Date,
    protected updatedAt: Date,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isValid(): boolean {
    return this.validate().length === 0;
  }

  public validate(): ValidationError[] {
    return [];
  }

  public assertValid(): void {
    const errors = this.validate();
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }

  public abstract toPrimitives(): TPrimitives;
}
