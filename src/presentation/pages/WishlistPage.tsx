import { User } from '../../domain/people/User';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { EmptyState } from '../components/common/EmptyState';
import { TourCard } from '../components/tours/TourCard';
import { useAppStore } from '../hooks/useAppStore';

export const WishlistPage = () => {
  const { state, store } = useAppStore();
  const user = state.currentPerson;
  const heroImage =
    store.getFeaturedTours(1)[0]?.getHeroImage() ??
    state.tours[0]?.getHeroImage() ??
    '';

  if (!(user instanceof User)) {
    return null;
  }

  const wishlistTours = state.tours.filter((tour) =>
    user.getWishlist().hasTour(tour.getId()),
  );

  return (
    <>
      <BreadcrumbHero
        eyebrow="Saved Dream Escapes"
        title="Wishlist Page"
        image={heroImage}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'Wishlist' },
        ]}
      />

      <section className="section">
        <div className="container">
          {wishlistTours.length === 0 ? (
            <EmptyState
              title="Your Wishlist is Empty"
              description="Tap the heart icon on any tour card and it will appear here instantly."
              actionLabel="Go To Shop"
              actionHref="/tours"
            />
          ) : (
            <div className="tour-grid">
              {wishlistTours.map((tour) => (
                <TourCard key={tour.getId()} tour={tour} showSummary />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
