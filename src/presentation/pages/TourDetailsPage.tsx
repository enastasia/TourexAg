import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Heart,
  Languages,
  MapPin,
  Package,
  Share2,
  Star,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { User } from '../../domain/people/User';
import { formatCurrency } from '../../shared/utils/formatters';
import { useAppStore } from '../hooks/useAppStore';
import { BookingSidebar } from '../components/tours/BookingSidebar';
import { RatingStars } from '../components/common/RatingStars';

const scoreLabels = {
  location: 'Location',
  amenities: 'Amenities',
  services: 'Services',
  price: 'Price',
  rooms: 'Rooms',
} as const;

const detailHeroCandidates = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1800&q=80',
  'https://images.pexels.com/photos/100362/pexels-photo-100362.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/128458/pexels-photo-128458.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/1479760/pexels-photo-1479760.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/141783/pexels-photo-141783.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/6136358/pexels-photo-6136358.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/695210/pexels-photo-695210.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/2376986/pexels-photo-2376986.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/530158/pexels-photo-530158.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/6130833/pexels-photo-6130833.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/10719873/pexels-photo-10719873.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/6153419/pexels-photo-6153419.jpeg?auto=compress&cs=tinysrgb&w=2200',
  'https://images.pexels.com/photos/8601121/pexels-photo-8601121.jpeg?auto=compress&cs=tinysrgb&w=2200',
] as const;

const sharedTourGalleryImages = [
  '/assets/tour-details/shared-gallery-main.jpg',
  '/assets/tour-details/shared-gallery-top-right.jpg',
  '/assets/tour-details/shared-gallery-bottom-left.jpg',
  '/assets/tour-details/shared-gallery-bottom-right.jpg',
] as const;

const isVideoSource = (source: string): boolean => /\.(mp4|webm|ogg)$/i.test(source);

const formatReviewDate = (value: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
    .format(value)
    .replace(',', ' .');

export const TourDetailsPage = () => {
  const { slug = '' } = useParams();
  const { store, state } = useAppStore();
  const tour = store.getTourBySlug(slug);
  const navigate = useNavigate();
  const location = useLocation();
  const [openDay, setOpenDay] = useState(1);
  const [heroCandidateIndex, setHeroCandidateIndex] = useState(0);
  const [reviewMessage, setReviewMessage] = useState('');
  const [replyName, setReplyName] = useState(state.currentPerson?.getFullName() ?? '');
  const [replyEmail, setReplyEmail] = useState(state.currentPerson?.getEmail() ?? '');
  const [scores, setScores] = useState({
    location: 0,
    amenities: 0,
    services: 0,
    price: 0,
    rooms: 0,
  });

  const averageScores = useMemo(() => tour?.getScoreBreakdown(), [tour]);

  if (!tour) {
    return <Navigate to="/404" replace />;
  }

  const wishlisted =
    state.currentPerson instanceof User && state.currentPerson.hasWishlistedTour(tour.getId());

  const aboutText = `${tour.getSummary()} Designed specifically for travellers who want a guided route, clear pacing and fewer logistical gaps while moving through ${tour.getDestinationLabel()}.`;
  const locationText = `This itinerary is centered around ${tour.getDestinationLabel()} and is structured to keep transfers simple while preserving strong visual stops and local highlights.`;

  const handleWishlist = () => {
    const result = store.toggleWishlist(tour.getId());

    if (!result.success && !state.currentPerson) {
      navigate('/login', { state: { from: location } });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: tour.getTitle(),
      text: `Explore ${tour.getTitle()} on Tourex`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReviewSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = store.submitReview({
      tourId: tour.getId(),
      message: reviewMessage,
      scores,
    });

    if (result.success) {
      setReviewMessage('');
      return;
    }

    if (!state.currentPerson) {
      navigate('/login', { state: { from: location } });
    }
  };

  const mapUrl = `https://www.google.com/maps?q=${tour
    .getDestination()
    .getLatitude()},${tour.getDestination().getLongitude()}&z=11&output=embed`;
  const galleryImages = [
    sharedTourGalleryImages[0] ?? tour.getGallery()[0],
    sharedTourGalleryImages[1] ?? tour.getGallery()[1],
    sharedTourGalleryImages[2] ?? tour.getGallery()[2],
    sharedTourGalleryImages[3] ?? tour.getGallery()[3],
  ];
  const activeHeroCandidate = detailHeroCandidates[heroCandidateIndex];
  const showPreviousHeroCandidate = () => {
    setHeroCandidateIndex((current) =>
      current === 0 ? detailHeroCandidates.length - 1 : current - 1,
    );
  };
  const showNextHeroCandidate = () => {
    setHeroCandidateIndex((current) =>
      current === detailHeroCandidates.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <>
      <section
        className="tour-detail-strip"
        style={{
          backgroundImage: `url(${activeHeroCandidate})`,
        }}
      >
        <div className="container tour-detail-hero-picker">
          <button type="button" onClick={showPreviousHeroCandidate}>
            &lt;
          </button>
          <span>
            Hero {heroCandidateIndex + 1} / {detailHeroCandidates.length}
          </span>
          <div className="tour-detail-hero-picker__options">
            {detailHeroCandidates.map((candidate, index) => (
              <button
                type="button"
                key={candidate}
                className={index === heroCandidateIndex ? 'is-active' : ''}
                onClick={() => setHeroCandidateIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button type="button" onClick={showNextHeroCandidate}>
            &gt;
          </button>
        </div>
      </section>

      <section className="tour-detail-top">
        <div className="container">
          <div className="tour-detail-overview">
            <div className="tour-detail-overview__main">
              <h1>{tour.getTitle()}</h1>
              <div className="tour-detail-overview__meta">
                <span>
                  <MapPin size={16} />
                  {tour.getLocationNote()}
                </span>
                <span>
                  <RatingStars value={tour.getAverageRating()} size={18} />
                  ({tour.getReviewCount()} Reviews)
                </span>
              </div>
            </div>

            <div className="tour-detail-overview__actions">
              <button type="button" onClick={handleShare}>
                <Share2 size={16} />
                Share
              </button>
              <button
                type="button"
                className={wishlisted ? 'is-active' : ''}
                onClick={handleWishlist}
              >
                <Heart size={16} />
                Add To Wishlist
              </button>
            </div>
          </div>

          <div className="tour-detail-gallery">
            <img
              className="tour-detail-gallery__main"
              src={galleryImages[0]}
              alt={tour.getTitle()}
            />

            <div className="tour-detail-gallery__side">
              <div className="tour-detail-gallery__video">
                {isVideoSource(galleryImages[1]) ? (
                  <video
                    src={galleryImages[1]}
                    aria-label={`${tour.getTitle()} scenic view`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img src={galleryImages[1]} alt={`${tour.getTitle()} scenic view`} />
                )}
              </div>

              <div className="tour-detail-gallery__thumbs">
                <img src={galleryImages[2]} alt={`${tour.getTitle()} stay`} />
                <img src={galleryImages[3]} alt={`${tour.getTitle()} pool`} />
              </div>
            </div>
          </div>

          <div className="tour-detail-facts">
            <article>
              <span className="tour-detail-facts__icon">
                <CalendarDays size={18} />
              </span>
              <div>
                <small>Duration</small>
                <strong>{tour.getDurationDays()} Days</strong>
              </div>
            </article>

            <article>
              <span className="tour-detail-facts__icon">
                <Package size={18} />
              </span>
              <div>
                <small>Type</small>
                <strong>{tour.getTypeLabel()}</strong>
              </div>
            </article>

            <article>
              <span className="tour-detail-facts__icon">
                <Users size={18} />
              </span>
              <div>
                <small>Group Size</small>
                <strong>{tour.getGroupSize()} People</strong>
              </div>
            </article>

            <article>
              <span className="tour-detail-facts__icon">
                <Languages size={18} />
              </span>
              <div>
                <small>Languages</small>
                <strong>{tour.getLanguages().join(', ')}</strong>
              </div>
            </article>

            <div className="tour-detail-facts__price">
              <span>From</span>
              <strong>{formatCurrency(tour.getDiscountedPrice(), 2)}</strong>
              <small>/ Person</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section tour-detail-body">
        <div className="container tour-detail-layout">
          <div className="tour-detail-main">
            <section className="tour-detail-section">
              <h2>About This Tour</h2>
              <p className="tour-detail-copy">{aboutText}</p>

              <h3>Trip Highlights</h3>
              <ul className="tour-detail-check-list">
                {tour.getHighlightItems().map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="tour-detail-section">
              <h2>Included/Exclude</h2>
              <div className="tour-detail-check-grid">
                <ul className="tour-detail-check-list">
                  {tour.getIncludedItems().map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <ul className="tour-detail-cross-list">
                  {tour.getExcludedItems().map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="tour-detail-section">
              <h2>Tour Plan</h2>
              <p className="tour-detail-copy">{locationText}</p>

              <div className="tour-detail-accordion">
                {tour.getItinerary().map((entry) => {
                  const isOpen = openDay === entry.day;

                  return (
                    <article
                      key={entry.day}
                      className={`tour-detail-accordion__item ${isOpen ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="tour-detail-accordion__header"
                        onClick={() => setOpenDay(isOpen ? 0 : entry.day)}
                      >
                        <span className="tour-detail-accordion__day">
                          Day-{String(entry.day).padStart(2, '0')}
                        </span>
                        <strong>{entry.title}</strong>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {isOpen ? (
                        <div className="tour-detail-accordion__content">
                          <p>{entry.description}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="tour-detail-section">
              <h2>Location</h2>
              <p className="tour-detail-copy">{locationText}</p>
              <iframe
                className="tour-detail-map"
                title={tour.getDestinationLabel()}
                src={mapUrl}
                loading="lazy"
              />
            </section>

            <section className="tour-detail-section">
              <h2>Customer Reviews</h2>
              <p className="tour-detail-copy">{aboutText}</p>

              <div className="tour-review-overview">
                <div className="tour-review-overview__score">
                  <strong>{tour.getAverageRating().toFixed(1)}</strong>
                  <span>Excellent</span>
                  <small>Based On {tour.getReviewCount()} Reviews</small>
                </div>

                <div className="tour-review-overview__bars">
                  {averageScores
                    ? Object.entries(averageScores).map(
                        ([key, value]) => (
                          <div key={key}>
                            <span>{scoreLabels[key as keyof typeof scoreLabels]}</span>
                            <div>
                              <strong style={{ width: `${(value / 5) * 100}%` }} />
                            </div>
                            <em>{value}/5</em>
                          </div>
                        ),
                      )
                    : null}
                </div>
              </div>
            </section>

            <section className="tour-detail-section">
              <h2>{tour.getReviewCount()} Reviews</h2>

              <div className="tour-review-thread">
                {tour.getReviews().map((review) => (
                  <article key={review.getId()} className="tour-review-thread__item">
                    <img src={review.getAuthorAvatar()} alt={review.getAuthorName()} />

                    <div className="tour-review-thread__body">
                      <div className="tour-review-thread__header">
                        <div>
                          <h3>{review.getAuthorName()}</h3>
                          <div className="tour-review-thread__meta">
                            <span>{formatReviewDate(review.getCreatedAt())}</span>
                          </div>
                        </div>

                        <RatingStars value={review.getAverageScore()} size={20} />
                      </div>

                      <p>{review.getMessage()}</p>
                      <button type="button" className="tour-review-thread__reply">
                        Reply
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="tour-detail-section tour-detail-section--reply">
              <form className="tour-reply-form" onSubmit={handleReviewSubmit}>
                <h2>Leave A Reply</h2>

                <div className="tour-reply-form__ratings">
                  {(Object.keys(scores) as Array<keyof typeof scores>).map((key) => (
                    <label key={key} className="tour-reply-form__score-row">
                      <span>{scoreLabels[key]} :</span>
                      <div className="tour-reply-form__stars">
                        {Array.from({ length: 5 }, (_, index) => {
                          const value = index + 1;

                          return (
                            <button
                              key={`${key}-${value}`}
                              type="button"
                              onClick={() =>
                                setScores((current) => ({
                                  ...current,
                                  [key]: value,
                                }))
                              }
                            >
                              <Star
                                size={18}
                                className={value <= scores[key] ? 'is-active' : ''}
                                fill={value <= scores[key] ? 'currentColor' : 'none'}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="tour-reply-form__row">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={replyName}
                    onChange={(event) => setReplyName(event.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="E-mail Address"
                    value={replyEmail}
                    onChange={(event) => setReplyEmail(event.target.value)}
                  />
                </div>

                <textarea
                  placeholder="Write Message"
                  value={reviewMessage}
                  onChange={(event) => setReviewMessage(event.target.value)}
                />

                <button className="button button--primary" type="submit">
                  Submit Review
                </button>
              </form>
            </section>
          </div>

          <BookingSidebar key={tour.getId()} tour={tour} />
        </div>
      </section>
    </>
  );
};
