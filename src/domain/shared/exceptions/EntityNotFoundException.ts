import { DomainException } from './DomainException';

export class EntityNotFoundException extends DomainException {
  public constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier "${identifier}" was not found.`, 'ENTITY_NOT_FOUND');
  }
}
