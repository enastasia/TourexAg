import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  size?: number;
}

export const RatingStars = ({ value, size = 14 }: RatingStarsProps) => {
  const filled = Math.round(value);

  return (
    <span className="rating-stars">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={`star-${index + 1}`}
          size={size}
          className={index < filled ? 'is-filled' : ''}
        />
      ))}
    </span>
  );
};
