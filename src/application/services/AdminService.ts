import type { TourKind } from '../../shared/types/domain';
import { createId } from '../../shared/utils/identity';
import { slugify } from '../../shared/utils/formatters';
import { Tour, type TourPrimitives } from '../../domain/catalog/Tour';
import { CatalogRepository } from '../repositories/CatalogRepository';
import { UserRepository } from '../repositories/UserRepository';
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
  imageUrl: string;
  ribbonLabel: string;
}

export class AdminService {
  public constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public createTour(draft: AdminTourDraft): ServiceResult<Tour> {
    const now = new Date();
    const destinationTour = this.catalogRepository
      .getAll()
      .find((tour) => tour.getDestination().getId() === draft.destinationId);

    if (!destinationTour) {
      return failureResult('Choose an existing destination to create a new tour.');
    }

    const tour = this.restoreFromDraft(
      {
        ...destinationTour.toPrimitives(),
        id: createId('tour'),
        title: draft.title,
        slug: slugify(`${draft.title}-${Date.now()}`),
        summary: draft.summary,
        cardImage: draft.imageUrl || destinationTour.getCardImage(),
        heroImage: draft.imageUrl || destinationTour.getHeroImage(),
        gallery: [
          draft.imageUrl || destinationTour.getCardImage(),
          destinationTour.getHeroImage(),
          destinationTour.getCardImage(),
          draft.imageUrl || destinationTour.getHeroImage(),
        ],
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

    const nextTour = this.restoreFromDraft(
      {
        ...existingTour.toPrimitives(),
        title: draft.title,
        slug: slugify(draft.title),
        summary: draft.summary,
        cardImage: draft.imageUrl || existingTour.getCardImage(),
        heroImage: draft.imageUrl || existingTour.getHeroImage(),
        gallery: [
          draft.imageUrl || existingTour.getCardImage(),
          existingTour.getHeroImage(),
          existingTour.getCardImage(),
          draft.imageUrl || existingTour.getHeroImage(),
        ],
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
}
