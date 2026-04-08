import type { ISerializable } from '../../domain/shared/contracts';

export abstract class BrowserStorageRepository<
  TEntity extends ISerializable<TPrimitive>,
  TPrimitive,
> {
  protected constructor(private readonly storageKey: string) {}

  public getAll(): TEntity[] {
    try {
      return this.readRecords().map((record) => this.deserialize(record));
    } catch {
      this.clearStorage();
      return [];
    }
  }

  public saveAll(entities: TEntity[]): void {
    this.write(entities.map((entity) => entity.toPrimitives()));
  }

  public seed(entities: TEntity[]): void {
    if (this.getAll().length === 0) {
      this.saveAll(entities);
    }
  }

  protected abstract deserialize(record: TPrimitive): TEntity;

  protected findOne(
    predicate: (entity: TEntity) => boolean,
  ): TEntity | undefined {
    return this.getAll().find(predicate);
  }

  protected saveOrReplace(
    entity: TEntity,
    predicate: (current: TEntity) => boolean,
    insertMode: 'prepend' | 'append' = 'prepend',
  ): void {
    const entities = this.getAll();
    const index = entities.findIndex(predicate);

    if (index >= 0) {
      entities.splice(index, 1, entity);
    } else if (insertMode === 'prepend') {
      entities.unshift(entity);
    } else {
      entities.push(entity);
    }

    this.saveAll(entities);
  }

  protected removeWhere(predicate: (entity: TEntity) => boolean): void {
    this.saveAll(this.getAll().filter((entity) => !predicate(entity)));
  }

  protected appendMany(entities: TEntity[]): void {
    if (entities.length === 0) {
      return;
    }

    this.saveAll([...this.getAll(), ...entities]);
  }

  protected readRecords(): TPrimitive[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = window.localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as TPrimitive[]) : [];
    } catch {
      this.clearStorage();
      return [];
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }

  private write(records: TPrimitive[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(records));
  }
}
