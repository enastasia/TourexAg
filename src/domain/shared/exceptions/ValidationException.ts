import { DomainException } from './DomainException';
import type { ValidationError } from '../ValidationError';

export class ValidationException extends DomainException {
  public readonly errors: ValidationError[];

  public constructor(errors: ValidationError[]) {
    const summary = errors.map((e) => e.message).join(' ');
    super(summary, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}
