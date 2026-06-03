import { useRef, useState } from 'react';
import {
  Calendar,
  Camera,
  Heart,
  Mail,
  Pencil,
  Phone,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { Person } from '../../domain/people/Person';
import { User } from '../../domain/people/User';
import { formatCurrency } from '../../shared/utils/formatters';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeading } from '../components/common/SectionHeading';
import { TourCard } from '../components/tours/TourCard';
import { useAppStore } from '../hooks/useAppStore';

const compressImage = (file: File, maxWidth = 400, quality = 0.7): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export const AccountPage = () => {
  const { state, store } = useAppStore();
  const user = state.currentPerson;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');

  if (!(user instanceof User)) {
    return null;
  }

  const bookings = state.bookings.filter((booking) => booking.belongsToUser(user.getId()));
  const wishlistTours = state.tours.filter((tour) =>
    user.getWishlist().hasTour(tour.getId()),
  );

  const startEditing = () => {
    setEditName(user.getFullName());
    setEditPhone(user.getPhone());
    setEditAvatar(user.getAvatar());
    setEditError('');
    setEditing(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setEditAvatar(dataUrl);
  };

  const saveProfile = () => {
    if (editName.trim().length < 3) {
      setEditError('Full name must contain at least 3 characters.');
      return;
    }

    if (!Person.isValidPhone(editPhone)) {
      setEditError('Invalid phone number. Use format: +380 XX XXX XXXX');
      return;
    }

    setEditError('');
    store.updateCurrentProfile(editName, editPhone, editAvatar);
    setEditing(false);
  };

  return (
    <>
      <BreadcrumbHero
        eyebrow="My Account"
        title="Traveler Dashboard"
        image="/assets/hero-slider/slide-6.jpg"
        imagePosition="center 65%"
        overlay="none"
        className="breadcrumb-hero--tours"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
        ]}
      />

      <section className="section section--account-profile">
        <div className="container">
          {editing ? (
            <div className="account-profile account-profile--editing">
              <div
                className="account-profile__avatar account-profile__avatar--upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={editAvatar} alt="Avatar" />
                <div className="account-profile__avatar-overlay">
                  <Camera size={22} />
                  <span>Change</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  hidden
                />
              </div>
              <div className="account-profile__edit-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="+380 XX XXX XXXX"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
                {editError ? <p className="form-error">{editError}</p> : null}
                <div className="account-profile__edit-actions">
                  <button className="button button--primary" type="button" onClick={saveProfile}>
                    Save Changes
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => setEditing(false)}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="account-profile">
              <div className="account-profile__avatar">
                <img src={user.getAvatar()} alt={user.getFullName()} />
                <span className="account-profile__badge">
                  <UserRound size={14} />
                </span>
              </div>
              <div className="account-profile__info">
                <h2>{user.getFullName()}</h2>
                <div className="account-profile__details">
                  <span>
                    <Mail size={15} />
                    {user.getEmail()}
                  </span>
                  <span>
                    <Phone size={15} />
                    {user.getPhone()}
                  </span>
                </div>
              </div>
              <div className="account-profile__actions-row">
                <button className="button button--ghost" type="button" onClick={startEditing}>
                  <Pencil size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--account-metrics">
        <div className="container">
          <div className="dashboard-metrics dashboard-metrics--account">
            <article className="metric-card">
              <div className="metric-card__icon">
                <UserRound size={22} />
              </div>
              <div className="metric-card__content">
                <span>Confirmed Bookings</span>
                <strong>{bookings.length}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-card__icon metric-card__icon--pink">
                <Heart size={22} />
              </div>
              <div className="metric-card__content">
                <span>Wishlist Tours</span>
                <strong>{wishlistTours.length}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-card__icon metric-card__icon--green">
                <ShoppingCart size={22} />
              </div>
              <div className="metric-card__content">
                <span>Cart Total</span>
                <strong>{formatCurrency(state.currentCart?.getTotalPrice() ?? 0, 2)}</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--warm section--no-decor">
        <div className="container">
          <SectionHeading
            eyebrow="Travel History"
            title="My Bookings"
            description="All your confirmed tour reservations in one place."
          />
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Once you book a tour, it will appear here."
              actionLabel="Browse Tours"
              actionHref="/tours"
            />
          ) : (
            <div className="booking-cards">
              {bookings.map((booking) => (
                <article key={booking.getId()} className="booking-card">
                  <img
                    className="booking-card__thumb"
                    src={booking.getCoverImage()}
                    alt={booking.getTourTitle()}
                  />
                  <div className="booking-card__content">
                    <h3>{booking.getTourTitle()}</h3>
                    <span>{booking.getDestinationLabel()}</span>
                  </div>
                  <div className="booking-card__meta">
                    <Calendar size={14} />
                    <span>{booking.getStatus()}</span>
                  </div>
                  <strong className="booking-card__price">
                    {formatCurrency(booking.getTotalPrice(), 2)}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--no-decor">
        <div className="container">
          <SectionHeading
            eyebrow="Saved for Later"
            title="My Wishlist"
            description="Tours you've saved — browse and book when you're ready."
          />
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
        </div>
      </section>
    </>
  );
};
