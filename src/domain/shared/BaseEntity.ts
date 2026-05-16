import type { ISerializable, IValidatable } from './contracts';
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

  protected touch(): void {
    this.updatedAt = new Date();
  }

  public abstract toPrimitives(): TPrimitives;
}
