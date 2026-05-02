import { useEffect, useMemo, useReducer } from 'react';
import { RatingStars } from './RatingStars';

interface TestimonialReview {
  getId(): string;
  getAuthorAvatar(): string;
  getAuthorName(): string;
  getAuthorRole(): string;
  getMessage(): string;
}

interface TestimonialsCarouselProps {
  reviews: TestimonialReview[];
}

interface CarouselState {
  activeIndex: number;
  isAnimating: boolean;
}

type CarouselAction =
  | { type: 'reset' }
  | { type: 'advance' }
  | { type: 'disableAnimation' }
  | { type: 'jumpToStart' }
  | { type: 'enableAnimation' };

const chunkReviews = (reviews: TestimonialReview[], size: number): TestimonialReview[][] => {
  const pages: TestimonialReview[][] = [];

  for (let index = 0; index < reviews.length; index += size) {
    pages.push(reviews.slice(index, index + size));
  }

  return pages;
};

const reduceCarouselState = (
  state: CarouselState,
  action: CarouselAction,
): CarouselState => {
  switch (action.type) {
    case 'reset':
      return {
        activeIndex: 0,
        isAnimating: true,
      };
    case 'advance':
      return {
        ...state,
        activeIndex: state.activeIndex + 1,
      };
    case 'disableAnimation':
      return {
        ...state,
        isAnimating: false,
      };
    case 'jumpToStart':
      return {
        ...state,
        activeIndex: 0,
      };
    case 'enableAnimation':
      return {
        ...state,
        isAnimating: true,
      };
    default:
      return state;
  }
};

export const TestimonialsCarousel = ({ reviews }: TestimonialsCarouselProps) => {
  const pages = useMemo(() => chunkReviews(reviews, 3), [reviews]);
  const [carouselState, dispatch] = useReducer(reduceCarouselState, {
    activeIndex: 0,
    isAnimating: true,
  });
  const { activeIndex, isAnimating } = carouselState;

  useEffect(() => {
    dispatch({ type: 'reset' });
  }, [pages.length]);

  useEffect(() => {
    if (pages.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'advance' });
    }, 5600);

    return () => window.clearInterval(intervalId);
  }, [pages.length]);

  useEffect(() => {
    if (pages.length <= 1 || activeIndex !== pages.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'disableAnimation' });
      dispatch({ type: 'jumpToStart' });

      window.setTimeout(() => {
        dispatch({ type: 'enableAnimation' });
      }, 40);
    }, 920);

    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, pages.length]);

  if (pages.length === 0) {
    return null;
  }

  const renderedPages =
    pages.length > 1 ? [...pages, pages[0]] : pages;

  return (
    <div className="testimonials-carousel">
      <div className="testimonials-carousel__viewport">
        <div
          className={`testimonials-carousel__track ${isAnimating ? 'is-animating' : ''}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {renderedPages.map((page, pageIndex) => (
            <div className="testimonials-carousel__page" key={`testimonial-page-${pageIndex}`}>
              {page.map((review) => (
                <article key={`${review.getId()}-${pageIndex}`} className="testimonial-card">
                  <div className="testimonial-card__author">
                    <img src={review.getAuthorAvatar()} alt={review.getAuthorName()} />
                    <div>
                      <h3>{review.getAuthorName()}</h3>
                      <p>{review.getAuthorRole()}</p>
                    </div>
                  </div>
                  <p>{review.getMessage()}</p>
                  <RatingStars value={5} />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
