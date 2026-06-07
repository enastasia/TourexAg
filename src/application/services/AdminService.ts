import type { TourKind } from '../../shared/types/domain';
import { createId } from '../../shared/utils/identity';
import { slugify } from '../../shared/utils/formatters';
import { Tour, type TourPrimitives } from '../../domain/catalog/Tour';
import { EntityNotFoundException } from '../../domain/shared/exceptions/EntityNotFoundException';
import type { ICatalogRepository } from '../repositories/ICatalogRepository';
import type { IUserRepository } from '../repositories/IUserRepository';
import { failureResult, successResult, type ServiceResult } from './ServiceResult';

export interface AdminTourDraft {
  title: string;
  summary: string;
  destinationId: string;
  basePrice: number;
  durationDays: number;
  groupSize: number;
  typeLabel: string;
  kind: TourKind;
  images: string[];
  ribbonLabel: string;
}

export class AdminService {
  public constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  public createTour(draft: AdminTourDraft): ServiceResult<Tour> {
    const now = new Date();
    const destinationTour = this.catalogRepository
      .getAll()
      .find((tour) => tour.getDestination().getId() === draft.destinationId);

    if (!destinationTour) {
      return failureResult('Choose an existing destination to create a new tour.');
    }

    const images = draft.images ?? [];
    const cardImg = images[0] || destinationTour.getCardImage();
    const existingGallery = destinationTour.getGallery();
    const heroImg = images[1] || destinationTour.getHeroImage();
    const gallery = [
      images[1] || existingGallery[0] || destinationTour.getCardImage(),
      images[2] || existingGallery[1] || destinationTour.getHeroImage(),
      images[3] || existingGallery[2] || destinationTour.getCardImage(),
      images[4] || existingGallery[3] || destinationTour.getHeroImage(),
    ];

    const tour = this.restoreFromDraft(
      {
        ...destinationTour.toPrimitives(),
        id: createId('tour'),
        title: draft.title,
        slug: slugify(`${draft.title}-${Date.now()}`),
        summary: draft.summary,
        cardImage: cardImg,
        heroImage: heroImg,
        gallery,
        basePrice: draft.basePrice,
        locationNote: destinationTour.getDestinationLabel(),
        durationDays: draft.durationDays,
        groupSize: draft.groupSize,
        typeLabel: draft.typeLabel,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        kind: draft.kind,
        ribbonLabel: draft.ribbonLabel || this.defaultRibbonLabel(draft.kind),
        reviews: [],
      },
      draft.kind,
    );

    this.catalogRepository.saveTour(tour);
    return successResult(tour);
  }

  public updateTour(tourId: string, draft: AdminTourDraft): ServiceResult<Tour> {
    const existingTour = this.catalogRepository.findById(tourId);

    if (!existingTour) {
      return failureResult('Tour not found.');
    }

    const destinationChanged =
      draft.destinationId !== existingTour.getDestination().getId();

    let destinationPrimitives = existingTour.toPrimitives().destination;
    let locationNote = existingTour.toPrimitives().locationNote;

    if (destinationChanged) {
      const donorTour = this.catalogRepository
        .getAll()
        .find((t) => t.getDestination().getId() === draft.destinationId);
      if (donorTour) {
        destinationPrimitives = donorTour.getDestination().toPrimitives();
        locationNote = donorTour.getDestinationLabel();
      }
    }

    const nextTour = this.restoreFromDraft(
      {
        ...existingTour.toPrimitives(),
        destination: destinationPrimitives,
        locationNote,
        title: draft.title,
        slug: slugify(draft.title),
        summary: draft.summary,
        cardImage: (draft.images ?? [])[0] || existingTour.getCardImage(),
        heroImage: (draft.images ?? [])[1] || existingTour.getHeroImage(),
        gallery: (() => {
          const imgs = draft.images ?? [];
          const eg = existingTour.getGallery();
          return [
            imgs[1] || eg[0] || existingTour.getCardImage(),
            imgs[2] || eg[1] || existingTour.getHeroImage(),
            imgs[3] || eg[2] || existingTour.getCardImage(),
            imgs[4] || eg[3] || existingTour.getHeroImage(),
          ];
        })(),
        basePrice: draft.basePrice,
        durationDays: draft.durationDays,
        groupSize: draft.groupSize,
        typeLabel: draft.typeLabel,
        updatedAt: new Date().toISOString(),
        kind: draft.kind,
        ribbonLabel: draft.ribbonLabel || this.defaultRibbonLabel(draft.kind),
      },
      draft.kind,
    );

    this.catalogRepository.saveTour(nextTour);
    return successResult(nextTour);
  }

  public deleteTour(tourId: string): ServiceResult<void> {
    this.catalogRepository.deleteTour(tourId);
    return successResult(undefined);
  }

  public deleteReview(tourId: string, reviewId: string): ServiceResult<void> {
    try {
      const tour = this.requireTour(tourId);
      if (!tour.removeReview(reviewId)) return failureResult('Review not found.');
      this.catalogRepository.saveTour(tour);
      return successResult(undefined);
    } catch (error) {
      if (error instanceof EntityNotFoundException) return failureResult(error.message);
      throw error;
    }
  }

  public deleteUser(userId: string): ServiceResult<void> {
    try {
      const person = this.requirePerson(userId);
      if (person.toPrimitives().role === 'admin') return failureResult('Cannot delete an admin.');
      this.userRepository.deletePerson(userId);
      return successResult(undefined);
    } catch (error) {
      if (error instanceof EntityNotFoundException) return failureResult(error.message);
      throw error;
    }
  }

  public getRegisteredUsers() {
    return this.userRepository.getAll();
  }

  private restoreFromDraft(record: TourPrimitives, kind: TourKind): Tour {
    switch (kind) {
      case 'featured':
        return Tour.restore({ ...record, kind: 'featured' });
      case 'seasonal':
        return Tour.restore({
          ...record,
          kind: 'seasonal',
          seasonName: record.seasonName ?? 'Holiday',
          seasonMultiplier: record.seasonMultiplier ?? 0.9,
        });
      case 'premium':
        return Tour.restore({
          ...record,
          kind: 'premium',
          premiumMultiplier: record.premiumMultiplier ?? 1.14,
        });
      default:
        return Tour.restore({ ...record, kind: 'standard' });
    }
  }

  private defaultRibbonLabel(kind: TourKind): string {
    switch (kind) {
      case 'featured':
        return 'Featured';
      case 'seasonal':
        return 'Seasonal';
      case 'premium':
        return 'Private';
      default:
        return 'New';
    }
  }

  private requireTour(tourId: string): Tour {
    const tour = this.catalogRepository.findById(tourId);
    if (!tour) throw new EntityNotFoundException('Tour', tourId);
    return tour;
  }

  private requirePerson(personId: string) {
    const person = this.userRepository.findById(personId);
    if (!person) throw new EntityNotFoundException('User', personId);
    return person;
  }
}
