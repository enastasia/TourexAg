import { Heart, LogOut, ShoppingCart, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../domain/people/User';
import { formatCurrency } from '../../shared/utils/formatters';
import { EmptyState } from '../components/common/EmptyState';
import { TourCard } from '../components/tours/TourCard';
import { useAppStore } from '../hooks/useAppStore';

export const AccountPage = () => {
  const { state, store } = useAppStore();
  const navigate = useNavigate();
  const user = state.currentPerson;

  if (!(user instanceof User)) {
    return null;
  }

  const bookings = state.bookings.filter((booking) => booking.belongsToUser(user.getId()));
  const wishlistTours = state.tours.filter((tour) =>
    user.getWishlist().hasTour(tour.getId()),
  );
  const handleLogout = () => {
    store.logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className="section section--dashboard">
      <div className="container account-page">
        <div className="account-page__header">
          <img src={user.getAvatar()} alt={user.getFullName()} />
          <div className="account-page__header-body">
            <div className="account-page__header-copy">
              <p className="section-heading__eyebrow">Traveler Dashboard</p>
              <h1>{user.getFullName()}</h1>
              <p>{user.getEmail()}</p>
            </div>
            <button className="button button--ghost" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-metrics">
          <article>
            <UserRound size={20} />
            <span>Confirmed Bookings</span>
            <strong>{bookings.length}</strong>
          </article>
          <article>
            <Heart size={20} />
            <span>Wishlist Tours</span>
            <strong>{wishlistTours.length}</strong>
          </article>
          <article>
            <ShoppingCart size={20} />
            <span>Cart Total</span>
            <strong>{formatCurrency(state.currentCart?.getTotalPrice() ?? 0, 2)}</strong>
          </article>
        </div>

        <div className="account-page__grid">
          <article className="dashboard-card">
            <h2>Profile</h2>
            <p>Role: Traveler</p>
            <p>Phone: {user.getPhone()}</p>
            <p>Sections: {user.getDashboardSections().join(', ')}</p>
          </article>

          <article className="dashboard-card">
            <h2>My Bookings</h2>
            {bookings.length === 0 ? (
              <p>No confirmed bookings yet.</p>
            ) : (
              <div className="booking-history">
                {bookings.map((booking) => (
                  <div key={booking.getId()}>
                    <strong>{booking.getTourTitle()}</strong>
                    <span>{booking.getDestinationLabel()}</span>
                    <em>{formatCurrency(booking.getTotalPrice(), 2)}</em>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        <article className="dashboard-card">
          <h2>Wishlist</h2>
          {wishlistTours.length === 0 ? (
            <EmptyState
              title="No saved tours yet"
              description="Use the heart icon on any tour card to save it for later."
              actionLabel="Explore Tours"
              actionHref="/tours"
            />
          ) : (
            <div className="tour-grid">
              {wishlistTours.slice(0, 4).map((tour) => (
                <TourCard key={tour.getId()} tour={tour} />
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
};
