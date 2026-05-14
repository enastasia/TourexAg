import { Compass, MoveRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroSearchPanel } from '../components/common/HeroSearchPanel';
import { SectionHeading } from '../components/common/SectionHeading';
import { TestimonialsCarousel } from '../components/common/TestimonialsCarousel';
import { TourCard } from '../components/tours/TourCard';
import { useAppStore } from '../hooks/useAppStore';

// TODO: повернути слайдшоу після скриншота
const heroSlides = [
  '/assets/hero-slider/slide-2.jpg',
];

const homePopularTourImages = [
  '/assets/tours/home-popular-tour-1.jpg',
  '/assets/tours/home-popular-tour-2.jpg',
  '/assets/tours/home-popular-tour-3.jpg',
  '/assets/tours/home-popular-tour-4.jpg',
  '/assets/tours/home-popular-tour-5.jpg',
  '/assets/tours/home-popular-tour-6.jpg',
  '/assets/tours/home-popular-tour-7.jpg',
  '/assets/tours/home-popular-tour-8.jpg',
] as const;

export const HomePage = () => {
  const { store } = useAppStore();
  const featuredTours = store.getPopularTours(8);
  const testimonials = store
    .getTestimonials(60)
    .filter((review) => review.getAverageScore() > 4.5)
    .slice(0, 9);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__backgrounds" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <div
              key={slide}
              className="home-hero__background"
              style={{
                backgroundImage: `url('${slide}')`,
                animationDelay: `${index * 6}s, ${index * 6}s`,
              }}
            />
          ))}
        </div>
        <div className="container home-hero__content">
          <p className="home-hero__eyebrow">* This Offer Valid Till 22 August</p>
          <h1>Maldives island</h1>
          <p className="home-hero__subtitle">
            When an unknown printer took a galley offer type area year andey make
            specimen book.
          </p>
          <p className="home-hero__price">
            Booking Start From <strong>$299</strong>/night
          </p>
          <Link className="button button--primary" to="/tours">
            Take A Tour
            <MoveRight size={16} />
          </Link>
          <div className="home-hero__search">
            <HeroSearchPanel />
          </div>
        </div>
      </section>

      <section className="section section--intro">
        <div className="container intro-grid">
          <div className="intro-grid__column intro-grid__column--left">
            <img
              className="intro-grid__image intro-grid__image--large"
              src="/assets/decor/intro-palm-sunset.jpg"
              alt="Palm sunset"
            />
            <img
              className="intro-grid__image intro-grid__image--small"
              src="/assets/decor/intro-boat-cliffs.jpg"
              alt="Boat near coastal cliffs"
            />
          </div>
          <div className="intro-grid__content">
            <div className="watermark">Tripion</div>
            <p className="section-heading__eyebrow">Most Popular Tour</p>
            <h2>Let&apos;s Discover The World With Our Excellent Eyes</h2>
            <p>
              Whether you&apos;re looking for a romantic getaway, family-friendly
              solo journey to explore the world, a travel agency can provide a
              tailored itinerary that exceeds your expectations.
            </p>
            <Link className="button button--ghost" to="/tours">
              Take A Tour
              <MoveRight size={16} />
            </Link>
          </div>
          <div className="intro-grid__column intro-grid__column--right">
            <img
              className="intro-grid__image intro-grid__image--large"
              src="/assets/decor/intro-coast-flowers-wide.jpg"
              alt="Coastline with flowers"
            />
            <img
              className="intro-grid__image intro-grid__image--small"
              src="/assets/decor/intro-palms-dusk.jpg"
              alt="Palm trees at dusk"
            />
          </div>
        </div>
      </section>

      <section className="section section--warm section--warm-tour-grid">
        <div className="container">
          <SectionHeading
            className="section-heading--home-compact"
            eyebrow="Most Popular Tour Packages"
            title="Something Amazing Waiting For You"
            description="A curated slice of the catalog that shows different tour subclasses, pricing strategies and reviews through one shared Tour card pipeline."
          />
          <div className="tour-grid">
            {featuredTours.map((tour, index) => (
              <TourCard
                key={tour.getId()}
                tour={tour}
                imageOverride={homePopularTourImages[index]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--discover">
        <div className="container discover-grid">
          <div className="discover-grid__content">
            <p className="section-heading__eyebrow">Dream Your Next Trip</p>
            <h2>Discover When Even You Want To Go</h2>
            <p>
              Adventure travel may be the perfect solution if you are tired of the
              typical tourist destinations and want something more intentional.
            </p>
            <div className="feature-list">
              <article>
                <Compass size={24} />
                <div>
                  <h3>Best Travel Agency</h3>
                  <p>Route planning built around clear pacing, safety and better context.</p>
                </div>
              </article>
              <article>
                <ShieldCheck size={24} />
                <div>
                  <h3>Secure Journey With Us</h3>
                  <p>Business validation and booking summaries stay consistent end-to-end.</p>
                </div>
              </article>
            </div>
            <Link className="button button--primary" to="/pricing">
              Book Your Trip
            </Link>
          </div>
          <div className="discover-grid__visual">
            <div className="discover-grid__visual-frame">
              <img src="/assets/decor/discover-coast-tree-boat.jpg" alt="Coast view through pine trees" />
            </div>
            <span>TRAVEL</span>
          </div>
        </div>
      </section>

      <section className="section section--testimonials">
        <div className="container">
          <SectionHeading
            className="section-heading--home-compact"
            eyebrow="Clients Feedback About Us"
            title="See Those Lovely Words From Clients"
            description="Reviews are actual Review domain entities aggregated from the Tour hierarchy, not decorative text blobs."
          />
          <TestimonialsCarousel reviews={testimonials} />
        </div>
      </section>
    </>
  );
};
