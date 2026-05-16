import { BaseEntity } from '../shared/BaseEntity';

export interface DestinationPrimitives {
  id: string;
  city: string;
  country: string;
  label: string;
  image: string;
  heroImage: string;
  latitude: number;
  longitude: number;
  toursCount: number;
  createdAt: string;
  updatedAt: string;
}

export class Destination extends BaseEntity<DestinationPrimitives> {
  public constructor(
    id: string,
    private readonly city: string,
    private readonly country: string,
    private readonly label: string,
    private readonly image: string,
    private readonly heroImage: string,
    private readonly latitude: number,
    private readonly longitude: number,
    private readonly toursCount: number,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getCity(): string {
    return this.city;
  }

  public getCountry(): string {
    return this.country;
  }

  public getLabel(): string {
    return this.label;
  }

  public getImage(): string {
    return this.image;
  }

  public getHeroImage(): string {
    return this.heroImage;
  }

  public getLatitude(): number {
    return this.latitude;
  }

  public getLongitude(): number {
    return this.longitude;
  }

  public getToursCount(): number {
    return this.toursCount;
  }

  public override toPrimitives(): DestinationPrimitives {
    return {
      id: this.id,
      city: this.city,
      country: this.country,
      label: this.label,
      image: this.image,
      heroImage: this.heroImage,
      latitude: this.latitude,
      longitude: this.longitude,
      toursCount: this.toursCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: DestinationPrimitives): Destination {
    return new Destination(
      primitives.id,
      primitives.city,
      primitives.country,
      primitives.label,
      primitives.image,
      primitives.heroImage,
      primitives.latitude,
      primitives.longitude,
      primitives.toursCount,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
