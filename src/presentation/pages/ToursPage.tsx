import { LayoutGrid, Search } from 'lucide-react';
import type { TourSortMode } from '../../shared/types/domain';
import { useAppStore } from '../hooks/useAppStore';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { HeroSearchPanel } from '../components/common/HeroSearchPanel';
import { TourCard } from '../components/tours/TourCard';
import { TourFiltersSidebar } from '../components/tours/TourFiltersSidebar';

const catalogTourImagesByPage: Record<number, readonly string[]> = {
  1: [
    '/assets/tours/catalog-page-1-tour-01.jpg',
    '/assets/tours/catalog-page-1-tour-02.jpg',
    '/assets/tours/catalog-page-1-tour-03.jpg',
    '/assets/tours/catalog-page-1-tour-04.jpg',
    '/assets/tours/catalog-page-1-tour-05.jpg',
    '/assets/tours/catalog-page-1-tour-06.jpg',
    '/assets/tours/catalog-page-1-tour-07.jpg',
    '/assets/tours/catalog-page-1-tour-08.jpg',
    '/assets/tours/catalog-page-1-tour-09.jpg',
    '/assets/tours/catalog-page-1-tour-10.jpg',
    '/assets/tours/catalog-page-1-tour-11.jpg',
    '/assets/tours/catalog-page-1-tour-12.jpg',
  ],
};

const toursHeroImage = '/assets/tours/tours-hero-selected.jpg';

export const ToursPage = () => {
  const { store, state } = useAppStore();
  const catalogPage = store.getCatalogPage();
  const catalogTourImages = catalogTourImagesByPage[catalogPage.currentPage] ?? [];

  return (
    <>
      <BreadcrumbHero
        eyebrow="Discover New Journeys"
        title="Let's Tour The World"
        image={toursHeroImage}
        imagePosition="center 28%"
        className="breadcrumb-hero--tours"
        overlay="soft"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tour Grid' },
        ]}
      />

      <section className="search-overlap">
        <div className="container">
          <HeroSearchPanel compact />
        </div>
      </section>

      <section className="section section--tour-catalog">
        <div className="container container--wide tours-layout">
          <TourFiltersSidebar />

          <div className="tours-layout__content">
            <div className="catalog-toolbar">
              <div className="catalog-toolbar__actions">
                <div className="catalog-toolbar__search">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search tours"
                    value={state.filter.getQuery()}
                    onChange={(event) =>
                      store.updateFilter(
                        {
                          query: event.target.value,
                        },
                        true,
                      )
                    }
                  />
                </div>
                <select
                  value={state.filter.getSortBy()}
                  onChange={(event) =>
                    store.updateFilter(
                      {
                        sortBy: event.target.value as TourSortMode,
                      },
                      false,
                    )
                  }
                >
                  <option value="default">Default Sorting</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="ratingDesc">Best Rated</option>
                  <option value="durationAsc">Shortest Duration</option>
                </select>
                <button
                  type="button"
                  className="button button--ghost catalog-toolbar__reset"
                  onClick={() => store.resetFilter()}
                >
                  Clear All Filters
                </button>
                <button type="button" className="icon-button">
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>

            <div className="tour-grid tour-grid--catalog">
              {catalogPage.items.map((tour, index) => (
                <TourCard
                  key={tour.getId()}
                  tour={tour}
                  imageOverride={catalogTourImages[index]}
                />
              ))}
            </div>

            <div className="catalog-pagination">
              <button
                type="button"
                disabled={catalogPage.currentPage === 1}
                onClick={() =>
                  store.updateFilter({ page: catalogPage.currentPage - 1 }, false)
                }
              >
                Previous Page
              </button>
              {Array.from({ length: catalogPage.totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={page === catalogPage.currentPage ? 'is-active' : ''}
                    onClick={() => store.updateFilter({ page }, false)}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={catalogPage.currentPage === catalogPage.totalPages}
                onClick={() =>
                  store.updateFilter({ page: catalogPage.currentPage + 1 }, false)
                }
              >
                Next Page
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
