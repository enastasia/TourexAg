import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../../domain/people/User';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { EmptyState } from '../components/common/EmptyState';
import { TourCard } from '../components/tours/TourCard';
import { useAppStore } from '../hooks/useAppStore';

const ITEMS_PER_PAGE = 4;

export const WishlistPage = () => {
  const { state, store } = useAppStore();
  const user = state.currentPerson;
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.max(1, Math.ceil(wishlistTours.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedTours = wishlistTours.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  return (
    <>
      <BreadcrumbHero
        eyebrow="Saved Dream Escapes"
        title="Wishlist Page"
        image="/assets/backgrounds/wishlist-bg.jpg"
        imagePosition="center 45%"
        overlay="none"
        className="breadcrumb-hero--tours"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'Wishlist' },
        ]}
      />

      <section className="section section--wishlist">
        <div className="container">
          {wishlistTours.length === 0 ? (
            <EmptyState
              title="Your Wishlist is Empty"
              description="Tap the heart icon on any tour card and it will appear here instantly."
              actionLabel="Go To Shop"
              actionHref="/tours"
            />
          ) : (
            <>
              <div className="tour-grid">
                {pagedTours.map((tour) => (
                  <TourCard key={tour.getId()} tour={tour} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="catalog-pagination">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === safePage ? 'is-active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};
