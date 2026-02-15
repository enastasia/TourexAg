import type { ISerializable } from '../../domain/shared/contracts';

export abstract class BrowserStorageRepository<
  TEntity extends ISerializable<TPrimitive>,
  TPrimitive,
> {
  protected constructor(private readonly storageKey: string) {}

  public getAll(): TEntity[] {
    return this.read().map((record) => this.deserialize(record));
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

  private read(): TPrimitive[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = window.localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as TPrimitive[];
  }

  private write(records: TPrimitive[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(records));
  }
}
