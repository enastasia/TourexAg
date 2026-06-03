import {
  Camera,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  ImagePlus,
  MapPin,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { TourKind } from '../../shared/types/domain';
import { Admin } from '../../domain/people/Admin';
import { Person } from '../../domain/people/Person';
import { formatCurrency } from '../../shared/utils/formatters';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { SectionHeading } from '../components/common/SectionHeading';
import { RatingStars } from '../components/common/RatingStars';
import { useAppStore } from '../hooks/useAppStore';

const compressImage = (file: File, maxWidth = 1400, quality = 0.85): Promise<string> =>
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

const CATEGORY_OPTIONS = [
  'Adventure',
  'Culture',
  'Heritage',
  'Wellness',
  'Island',
  'Cruise',
  'Luxury',
  'Coastal',
  'Urban',
  'Alpine',
  'Architecture',
  'Tradition',
  'Desert',
  'Expedition',
  'Safari',
  'Private',
  'Concierge',
];

const KIND_MULTIPLIER: Record<TourKind, number> = {
  standard: 1,
  featured: 0.78,
  seasonal: 0.9,
  premium: 1.14,
};

const STATUS_CONFIG = {
  draft: { label: 'Pending', className: 'admin-booking-badge--pending' },
  confirmed: { label: 'Confirmed', className: 'admin-booking-badge--confirmed' },
  cancelled: { label: 'Cancelled', className: 'admin-booking-badge--cancelled' },
} as const;

interface TourFormState {
  title: string;
  summary: string;
  destinationId: string;
  basePrice: number;
  durationDays: number;
  groupSize: number;
  typeLabel: string;
  kind: TourKind;
  images: string[];
  ribbonLabel: string;
}

const initialForm: TourFormState = {
  title: '',
  summary: '',
  destinationId: '',
  basePrice: 299,
  durationDays: 3,
  groupSize: 8,
  typeLabel: 'Adventure',
  kind: 'standard',
  images: ['', '', '', '', ''],
  ribbonLabel: '',
};

const GALLERY_LABELS = ['Detail 1', 'Detail 2', 'Detail 3', 'Detail 4'];

export const AdminPage = () => {
  const { store, state } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null]);
  const [form, setForm] = useState<TourFormState>(initialForm);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [previewRating, setPreviewRating] = useState(0);
  const [previewReviewCount, setPreviewReviewCount] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const ADMIN_PAGE_SIZE = 5;
  const reviews = store.getAllReviews().slice(0, 6);
  const destinations = store.getCatalogMeta().destinations;
  const customers = store.getCustomers();

  if (!(state.currentPerson instanceof Admin)) {
    return null;
  }

  const admin = state.currentPerson;
  const selectedDestination = destinations.find((d) => d.id === form.destinationId);

  const startEditingProfile = () => {
    setEditName(admin.getFullName());
    setEditPhone(admin.getPhone());
    setEditAvatar(admin.getAvatar());
    setEditError('');
    setEditingProfile(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file, 400);
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
    setEditingProfile(false);
  };

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setForm((current) => {
      const images = [...current.images];
      images[index] = dataUrl;
      return { ...current, images };
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const images = [...current.images];
      images[index] = '';
      return { ...current, images };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingTourId) {
      const result = store.updateTour(editingTourId, form);
      if (result.success) {
        setEditingTourId(null);
        setForm(initialForm);
        setPreviewRating(0);
        setPreviewReviewCount(0);
      }
      return;
    }

    const result = store.createTour(form);
    if (result.success) {
      setForm(initialForm);
    }
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasCardImage = !!form.images[0];
  const previewPrice = Number(((form.basePrice || 0) * KIND_MULTIPLIER[form.kind]).toFixed(2));
  const previewBadge = form.kind === 'featured' ? 'Featured' : form.kind === 'seasonal' ? 'Seasonal' : form.kind === 'premium' ? 'Premium' : null;

  return (
    <>
      <BreadcrumbHero
        eyebrow="Administration"
        title="Admin Dashboard"
        image="/assets/hero-slider/slide-6.jpg"
        imagePosition="center 65%"
        overlay="none"
        className="breadcrumb-hero--tours"
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Admin' },
        ]}
      />

      <section className="section section--account-profile section--no-decor">
        <div className="container">
          {editingProfile ? (
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
                  <button className="button button--ghost" type="button" onClick={() => setEditingProfile(false)}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="account-profile">
              <div className="account-profile__avatar">
                <img src={admin.getAvatar()} alt={admin.getFullName()} />
                <span className="account-profile__badge account-profile__badge--admin">
                  <ShieldCheck size={14} />
                </span>
              </div>
              <div className="account-profile__info">
                <h2>{admin.getFullName()}</h2>
                <div className="account-profile__details">
                  <span>{admin.getEmail()}</span>
                </div>
              </div>
              <div className="account-profile__actions-row">
                <button className="button button--ghost" type="button" onClick={startEditingProfile}>
                  <Pencil size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--account-metrics section--no-decor">
        <div className="container">
          <div className="dashboard-metrics dashboard-metrics--admin">
            <article className="metric-card">
              <div className="metric-card__icon">
                <FileText size={22} />
              </div>
              <div className="metric-card__content">
                <span>Total Tours</span>
                <strong>{state.tours.length}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-card__icon metric-card__icon--pink">
                <Users size={22} />
              </div>
              <div className="metric-card__content">
                <span>Registered Users</span>
                <strong>{customers.length}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-card__icon metric-card__icon--gold">
                <Star size={22} />
              </div>
              <div className="metric-card__content">
                <span>Reviews</span>
                <strong>{store.getAllReviews().length}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-card__icon metric-card__icon--green">
                <ShieldCheck size={22} />
              </div>
              <div className="metric-card__content">
                <span>Bookings</span>
                <strong>{state.bookings.length}</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--warm section--no-decor" ref={formSectionRef}>
        <div className="container">
          <SectionHeading
            eyebrow="Tour Builder"
            title={editingTourId ? 'Edit Tour' : 'Create New Tour'}
          />
          <div className="admin-builder">
            <form className="admin-builder__form dashboard-card" onSubmit={handleSubmit}>
              <label className="admin-field">
                <span className="admin-field__label">Title</span>
                <input
                  type="text"
                  placeholder="Tour title"
                  value={form.title}
                  onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  required
                />
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Summary</span>
                <textarea
                  placeholder="Tour description"
                  value={form.summary}
                  onChange={(e) => setForm((c) => ({ ...c, summary: e.target.value }))}
                  required
                />
              </label>

              <div className="admin-form__grid">
                <label className="admin-field">
                  <span className="admin-field__label">Destination</span>
                  <select
                    value={form.destinationId}
                    onChange={(e) => setForm((c) => ({ ...c, destinationId: e.target.value }))}
                    required
                  >
                    <option value="">Select destination</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Tour Type</span>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm((c) => ({ ...c, kind: e.target.value as TourKind }))}
                  >
                    <option value="standard">Standard</option>
                    <option value="featured">Featured</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Category</span>
                  <select
                    value={form.typeLabel}
                    onChange={(e) => setForm((c) => ({ ...c, typeLabel: e.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Price</span>
                  <input
                    type="number"
                    min={1}
                    value={form.basePrice || ''}
                    onChange={(e) => setForm((c) => ({ ...c, basePrice: Number(e.target.value) || 0 }))}
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Duration</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={form.durationDays || ''}
                    onChange={(e) => {
                      const val = Math.min(14, Number(e.target.value) || 0);
                      setForm((c) => ({ ...c, durationDays: val }));
                    }}
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-field__label">Group Size</span>
                  <input
                    type="number"
                    min={1}
                    value={form.groupSize || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setForm((c) => ({ ...c, groupSize: val }));
                    }}
                  />
                </label>
              </div>

              <div className="admin-field">
                <span className="admin-field__label">Images</span>
                <div className="admin-images">
                  {GALLERY_LABELS.map((label, i) => {
                    const idx = i + 1;
                    return (
                      <div key={label} className="admin-images__slot">
                        {form.images[idx] ? (
                          <div className="admin-images__preview">
                            <img src={form.images[idx]} alt={label} />
                            <button
                              type="button"
                              className="admin-images__remove"
                              onClick={() => removeImage(idx)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="admin-images__upload"
                            onClick={() => imageInputRefs.current[idx]?.click()}
                          >
                            <ImagePlus size={20} />
                            <span>{label}</span>
                          </button>
                        )}
                        <input
                          ref={(el) => { imageInputRefs.current[idx] = el; }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(idx, e)}
                          hidden
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-form__actions">
                <button className="button button--primary" type="submit">
                  {editingTourId ? 'Update Tour' : 'Create Tour'}
                </button>
                {editingTourId ? (
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => {
                      setEditingTourId(null);
                      setForm(initialForm);
                      setPreviewRating(0);
                      setPreviewReviewCount(0);
                    }}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>

            <div className="admin-builder__preview">
              <article className="tour-card admin-builder__card">
                <div className="tour-card__media">
                  {previewBadge && (
                    <span className="tour-card__badge">{previewBadge}</span>
                  )}
                  {hasCardImage ? (
                    <>
                      <img src={form.images[0]} alt={form.title || 'Tour preview'} />
                      <div className="admin-builder__card-actions">
                        <button type="button" onClick={() => imageInputRefs.current[0]?.click()}>
                          <Camera size={14} />
                        </button>
                        <button type="button" onClick={() => removeImage(0)}>
                          <X size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-builder__card-upload"
                      onClick={() => imageInputRefs.current[0]?.click()}
                    >
                      <ImagePlus size={28} />
                      <span>Card Image</span>
                    </button>
                  )}
                  <input
                    ref={(el) => { imageInputRefs.current[0] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(0, e)}
                    hidden
                  />
                </div>
                <div className="tour-card__body">
                  <h3>{form.title || 'Tour Title'}</h3>
                  <div className="tour-card__meta">
                    <span>
                      <MapPin size={14} />
                      {selectedDestination?.label || 'Destination'}
                    </span>
                    <span>
                      <Clock3 size={14} />
                      {form.durationDays || 0} Days
                    </span>
                    <span>
                      <Users size={14} />
                      {form.groupSize || 0} Guests
                    </span>
                  </div>
                  <div className="tour-card__footer">
                    <div className="tour-card__price">
                      {previewPrice < (form.basePrice || 0) ? (
                        <span className="tour-card__price-old">
                          {formatCurrency(form.basePrice || 0)}
                        </span>
                      ) : (
                        <span
                          className="tour-card__price-old tour-card__price-old--placeholder"
                          aria-hidden="true"
                        >
                          {formatCurrency(previewPrice)}
                        </span>
                      )}
                      <div className="tour-card__price-current">
                        <strong>{formatCurrency(previewPrice)}</strong>
                        <small>/Person</small>
                      </div>
                    </div>
                    <div className="tour-card__rating">
                      <RatingStars value={previewRating} size={13} />
                      <small>({previewReviewCount} Reviews)</small>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--no-decor">
        <div className="container">
          <SectionHeading
            eyebrow="Manage"
            title="Tour Catalog"
            description="Edit, update, or remove tours from the active catalog."
          />
          {(() => {
            const totalPages = Math.max(1, Math.ceil(state.tours.length / ADMIN_PAGE_SIZE));
            const safePage = Math.min(catalogPage, totalPages);
            const startIndex = (safePage - 1) * ADMIN_PAGE_SIZE;
            const pageTours = state.tours.slice(startIndex, startIndex + ADMIN_PAGE_SIZE);

            return (
              <>
                <div className="admin-catalog">
                  {pageTours.map((tour) => (
                    <article key={tour.getId()} className="admin-catalog__item">
                      <img
                        className="admin-catalog__thumb"
                        src={tour.getCardImage()}
                        alt={tour.getTitle()}
                      />
                      <div className="admin-catalog__info">
                        <h3>{tour.getTitle()}</h3>
                        <div className="admin-catalog__meta">
                          <span>{tour.getDestinationLabel()}</span>
                          <span>{tour.getDurationDays()} days</span>
                        </div>
                      </div>
                      <strong className="admin-catalog__price">
                        {formatCurrency(tour.getDiscountedPrice())}
                      </strong>
                      <div className="admin-catalog__actions">
                        <button
                          className="button button--ghost"
                          type="button"
                          onClick={() => {
                            setEditingTourId(tour.getId());
                            const gallery = tour.getGallery();
                            setForm({
                              title: tour.getTitle(),
                              summary: tour.getSummary(),
                              destinationId: tour.getDestination().getId(),
                              basePrice: tour.getBasePrice(),
                              durationDays: tour.getDurationDays(),
                              groupSize: tour.getGroupSize(),
                              typeLabel: tour.getTypeLabel(),
                              kind: tour.getKind(),
                              images: [
                                tour.getCardImage(),
                                gallery[0] || '',
                                gallery[1] || '',
                                gallery[2] || '',
                                gallery[3] || '',
                              ],
                              ribbonLabel: '',
                            });
                            setPreviewRating(tour.getReviewStarBucket());
                            setPreviewReviewCount(tour.getReviewCount());
                            scrollToForm();
                          }}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          className="button button--ghost admin-catalog__delete"
                          type="button"
                          onClick={() => store.deleteTour(tour.getId())}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="catalog-pagination" style={{ marginTop: 24 }}>
                    <button
                      type="button"
                      disabled={safePage === 1}
                      onClick={() => setCatalogPage(safePage - 1)}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={page === safePage ? 'is-active' : ''}
                        onClick={() => setCatalogPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={safePage === totalPages}
                      onClick={() => setCatalogPage(safePage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      <section className="section section--warm section--no-decor">
        <div className="container">
          <SectionHeading
            eyebrow="Users"
            title="Registered Users"
            description="View user profiles and their booking history."
          />
          <div className="admin-users">
            {customers.length === 0 ? (
              <p className="admin-users__empty">No registered users yet.</p>
            ) : (
              customers.map((user) => {
                const isExpanded = expandedUserId === user.getId();
                const userBookings = state.bookings.filter((b) => b.belongsToUser(user.getId()));

                return (
                  <div key={user.getId()} className="admin-user-card">
                    <button
                      type="button"
                      className="admin-user-card__header"
                      onClick={() => setExpandedUserId(isExpanded ? null : user.getId())}
                    >
                      <img src={user.getAvatar()} alt={user.getFullName()} />
                      <div className="admin-user-card__info">
                        <strong>{user.getFullName()}</strong>
                        <span>{user.getEmail()}</span>
                      </div>
                      <div className="admin-user-card__stats">
                        <span>{userBookings.length} bookings</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      type="button"
                      className="admin-user-card__delete"
                      title="Delete user"
                      onClick={() => store.deleteUser(user.getId())}
                    >
                      <Trash2 size={14} />
                    </button>

                    {isExpanded && (
                      <div className="admin-user-card__body">
                        {userBookings.length === 0 ? (
                          <p className="admin-user-card__no-bookings">No bookings yet.</p>
                        ) : (
                          <div className="admin-user-bookings">
                            {userBookings.map((booking) => {
                              const cfg = STATUS_CONFIG[booking.getStatus()];
                              return (
                                <div key={booking.getId()} className="admin-booking-row">
                                  <img
                                    src={booking.getCoverImage()}
                                    alt={booking.getTourTitle()}
                                    className="admin-booking-row__cover"
                                  />
                                  <div className="admin-booking-row__info">
                                    <strong>{booking.getTourTitle()}</strong>
                                    <span>{booking.getDestinationLabel()}</span>
                                  </div>
                                  <div className="admin-booking-row__details">
                                    <span>{booking.getRequest().getGuestCount()} guests</span>
                                    <strong>{formatCurrency(booking.getTotalPrice())}</strong>
                                  </div>
                                  <span className={`admin-booking-badge ${cfg.className}`}>
                                    {cfg.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="section section--no-decor">
        <div className="container">
          <SectionHeading
            eyebrow="Feedback"
            title="Recent Reviews"
            description="Latest traveler reviews across all tours."
          />
          <div className="admin-reviews">
            {reviews.map((review) => (
              <article key={review.getId()} className="admin-review-card">
                <div className="admin-review-card__header">
                  <img src={review.getAuthorAvatar()} alt={review.getAuthorName()} />
                  <div>
                    <strong>{review.getAuthorName()}</strong>
                    <RatingStars value={Math.round(review.getAverageScore())} />
                  </div>
                  <button
                    type="button"
                    className="admin-review-card__delete"
                    onClick={() => store.deleteReview(review.getTourId(), review.getId())}
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p>{review.getMessage()}</p>
                <span className="admin-review-card__score">
                  {review.getAverageScore().toFixed(1)} / 5
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
