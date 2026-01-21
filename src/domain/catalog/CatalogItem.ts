import { BaseEntity } from '../shared/BaseEntity';
import { Destination, type DestinationPrimitives } from './Destination';
import type { ValidationError } from '../shared/ValidationError';

export interface CatalogItemPrimitives {
  id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string;
  cardImage: string;
  gallery: string[];
  destination: DestinationPrimitives;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}

export abstract class CatalogItem<
  TPrimitives extends CatalogItemPrimitives,
> extends BaseEntity<TPrimitives> {
  protected constructor(
    id: string,
    protected title: string,
    protected slug: string,
    protected summary: string,
    protected heroImage: string,
    protected cardImage: string,
    protected gallery: string[],
    protected destination: Destination,
    protected basePrice: number,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getTitle(): string {
    return this.title;
  }

  public getSlug(): string {
    return this.slug;
  }

  public getSummary(): string {
    return this.summary;
  }

  public getHeroImage(): string {
    return this.heroImage;
  }

  public getCardImage(): string {
    return this.cardImage;
  }

  public getGallery(): string[] {
    return [...this.gallery];
  }

  public getDestination(): Destination {
    return this.destination;
  }

  public getDestinationLabel(): string {
    return this.destination.getLabel();
  }

  public getBasePrice(): number {
    return this.basePrice;
  }

  public override validate(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (this.title.trim().length < 4) {
      errors.push({
        field: 'title',
        message: 'Catalog item title must contain at least 4 characters.',
      });
    }

    if (this.basePrice <= 0) {
      errors.push({
        field: 'basePrice',
        message: 'Catalog item price must be greater than zero.',
      });
    }

    return errors;
  }
}
