import { Review } from '../../domain/reviews/Review';
import type { ICatalogRepository } from '../repositories/ICatalogRepository';
import type { IUserRepository } from '../repositories/IUserRepository';
import { createId } from '../../shared/utils/identity';
import { failureResult, successResult, type ServiceResult } from './ServiceResult';

export interface ReviewDraft {
  tourId: string;
  message: string;
  scores: {
    location: number;
    amenities: number;
    services: number;
    price: number;
    rooms: number;
  };
}

export class ReviewService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly catalogRepository: ICatalogRepository,
  ) {}

  public createReview(userId: string, draft: ReviewDraft): ServiceResult<void> {
    const person = this.userRepository.findById(userId);
    const tour = this.catalogRepository.findById(draft.tourId);

    if (!person || !tour) {
      return failureResult('Unable to find the user or the selected tour.');
    }

    const review = new Review(
      createId('review'),
      userId,
      draft.tourId,
      person.getFullName(),
      person.getRole() === 'admin' ? 'Administrator' : 'Verified Traveller',
      person.getAvatar(),
      draft.message,
      draft.scores,
    );

    if (!review.isValid()) {
      return failureResult(
        'Review must contain valid scores and a meaningful comment.',
      );
    }

    tour.addReview(review);
    this.catalogRepository.saveTour(tour);

    return successResult(undefined);
  }

  public getAllReviews(): Review[] {
    return this.catalogRepository
      .getAll()
      .flatMap((tour) => tour.getReviews())
      .sort(
        (left, right) =>
          right.getCreatedAt().getTime() - left.getCreatedAt().getTime(),
      );
  }
}
