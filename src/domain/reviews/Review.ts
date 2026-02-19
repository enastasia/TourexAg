import { BaseEntity } from '../shared/BaseEntity';
import type { IUserOwned } from '../shared/contracts';
import type { ValidationError } from '../shared/ValidationError';

export interface ReviewScores {
  location: number;
  amenities: number;
  services: number;
  price: number;
  rooms: number;
}

export interface ReviewPrimitives {
  id: string;
  userId: string;
  tourId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  message: string;
  scores: ReviewScores;
  createdAt: string;
  updatedAt: string;
}

export class Review extends BaseEntity<ReviewPrimitives> implements IUserOwned {
  public constructor(
    id: string,
    private readonly userId: string,
    private readonly tourId: string,
    private readonly authorName: string,
    private readonly authorRole: string,
    private readonly authorAvatar: string,
    private readonly message: string,
    private readonly scores: ReviewScores,
    createdAt = new Date(),
    updatedAt = new Date(),
  ) {
    super(id, createdAt, updatedAt);
  }

  public getOwnerId(): string {
    return this.userId;
  }

  public belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  public getTourId(): string {
    return this.tourId;
  }

  public getAuthorName(): string {
    return this.authorName;
  }

  public getAuthorRole(): string {
    return this.authorRole;
  }

  public getAuthorAvatar(): string {
    return this.authorAvatar;
  }

  public getMessage(): string {
    return this.message;
  }

  public getScores(): ReviewScores {
    return { ...this.scores };
  }

  public getAverageScore(): number {
    const values = Object.values(this.scores);
    const total = values.reduce((sum, score) => sum + score, 0);
    return Number((total / values.length).toFixed(1));
  }

  public override validate(): ValidationError[] {
    const errors: ValidationError[] = [];

    if (this.message.trim().length < 24) {
      errors.push({
        field: 'message',
        message: 'Review message must contain at least 24 characters.',
      });
    }

    Object.entries(this.scores).forEach(([field, value]) => {
      if (value < 1 || value > 5) {
        errors.push({
          field,
          message: 'Each review score must stay between 1 and 5.',
        });
      }
    });

    return errors;
  }

  public override toPrimitives(): ReviewPrimitives {
    return {
      id: this.id,
      userId: this.userId,
      tourId: this.tourId,
      authorName: this.authorName,
      authorRole: this.authorRole,
      authorAvatar: this.authorAvatar,
      message: this.message,
      scores: this.getScores(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static restore(primitives: ReviewPrimitives): Review {
    return new Review(
      primitives.id,
      primitives.userId,
      primitives.tourId,
      primitives.authorName,
      primitives.authorRole,
      primitives.authorAvatar,
      primitives.message,
      primitives.scores,
      new Date(primitives.createdAt),
      new Date(primitives.updatedAt),
    );
  }
}
