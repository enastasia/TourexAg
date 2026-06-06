export class DomainException extends Error {
  public readonly code: string;

  public constructor(message: string, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}
