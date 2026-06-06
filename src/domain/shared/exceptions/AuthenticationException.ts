import { DomainException } from './DomainException';

export class AuthenticationException extends DomainException {
  public constructor(message = 'Authentication failed.') {
    super(message, 'AUTHENTICATION_ERROR');
  }
}
