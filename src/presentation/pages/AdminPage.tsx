import { FileText, LogOut, ShieldCheck, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TourKind } from '../../shared/types/domain';
import { Admin } from '../../domain/people/Admin';
import { formatCurrency } from '../../shared/utils/formatters';
import { useAppStore } from '../hooks/useAppStore';

const initialForm = {
  title: '',
  summary: '',
  destinationId: '',
  basePrice: 299,
  durationDays: 3,
  groupSize: 18,
  typeLabel: 'Adventure',
  kind: 'standard' as TourKind,
  imageUrl: '',
  ribbonLabel: '',
};

export const AdminPage = () => {
  const { store, state } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const users = store.getCustomers();
  const reviews = store.getAllReviews().slice(0, 6);
  const destinations = store.getCatalogMeta().destinations;

  if (!(state.currentPerson instanceof Admin)) {
    return null;
  }

  const handleLogout = () => {
    store.logout();
    navigate('/login', { replace: true });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingTourId) {
      const result = store.updateTour(editingTourId, form);
      if (result.success) {
        setEditingTourId(null);
        setForm(initialForm);
      }
      return;
    }

    const result = store.createTour(form);
    if (result.success) {
      setForm(initialForm);
    }
  };

  return (
    <section className="section section--dashboard">
      <div className="container admin-page">
        <div className="account-page__header">
          <img src={state.currentPerson.getAvatar()} alt={state.currentPerson.getFullName()} />
          <div className="account-page__header-copy">
            <p className="section-heading__eyebrow">Admin Dashboard</p>
            <h1>{state.currentPerson.getFullName()}</h1>
            <p>{state.currentPerson.getAdminActions().join(' · ')}</p>
          </div>
          <button
            className="button button--ghost account-page__logout"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="dashboard-metrics">
          <article>
            <FileText size={20} />
            <span>Total Tours</span>
            <strong>{state.tours.length}</strong>
          </article>
          <article>
            <Users size={20} />
            <span>Registered Users</span>
            <strong>{users.length}</strong>
          </article>
          <article>
            <Star size={20} />
            <span>Reviews</span>
            <strong>{reviews.length}</strong>
          </article>
          <article>
            <ShieldCheck size={20} />
            <span>Bookings</span>
            <strong>{state.bookings.length}</strong>
          </article>
        </div>

        <div className="admin-page__grid">
          <article className="dashboard-card">
            <h2>{editingTourId ? 'Edit Tour' : 'Create New Tour'}</h2>
            <form className="admin-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Tour Title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
              <textarea
                placeholder="Summary"
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summary: event.target.value }))
                }
                required
              />
              <div className="admin-form__grid">
                <select
                  value={form.destinationId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      destinationId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Choose Destination</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.kind}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      kind: event.target.value as TourKind,
                    }))
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="featured">Featured</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="premium">Premium</option>
                </select>
                <input
                  type="number"
                  placeholder="Base Price"
                  value={form.basePrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      basePrice: Number(event.target.value),
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Duration"
                  value={form.durationDays}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationDays: Number(event.target.value),
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Group Size"
                  value={form.groupSize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      groupSize: Number(event.target.value),
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Type Label"
                  value={form.typeLabel}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      typeLabel: event.target.value,
                    }))
                  }
                />
              </div>
              <input
                type="url"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Ribbon Label"
                value={form.ribbonLabel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ribbonLabel: event.target.value,
                  }))
                }
              />
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
                    }}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="dashboard-card">
            <h2>Registered Users</h2>
            <div className="admin-list">
              {users.map((user) => (
                <div key={user.getId()}>
                  <strong>{user.getFullName()}</strong>
                  <span>{user.getEmail()}</span>
                  <em>{user.getPhone()}</em>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="dashboard-card">
          <h2>Catalog Management</h2>
          <div className="admin-list admin-list--catalog">
            {state.tours.map((tour) => (
              <div key={tour.getId()}>
                <div>
                  <strong>{tour.getTitle()}</strong>
                  <span>{tour.getDestinationLabel()}</span>
                  <em>{formatCurrency(tour.getDiscountedPrice())}</em>
                </div>
                <div className="admin-list__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTourId(tour.getId());
                      setForm({
                        title: tour.getTitle(),
                        summary: tour.getSummary(),
                        destinationId: tour.getDestination().getId(),
                        basePrice: tour.getBasePrice(),
                        durationDays: tour.getDurationDays(),
                        groupSize: tour.getGroupSize(),
                        typeLabel: tour.getTypeLabel(),
                        kind: tour.getKind(),
                        imageUrl: tour.getCardImage(),
                        ribbonLabel: tour.getRibbonLabel() ?? '',
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => store.deleteTour(tour.getId())}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <h2>Recent Reviews</h2>
          <div className="admin-list">
            {reviews.map((review) => (
              <div key={review.getId()}>
                <strong>{review.getAuthorName()}</strong>
                <span>{review.getMessage()}</span>
                <em>{review.getAverageScore()}/5</em>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};
