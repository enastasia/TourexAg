import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';

export const RegisterPage = () => {
  const { store } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLocalError('');
    const result = store.register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.success) {
      navigate('/account', { replace: true });
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-grid">
        <div className="auth-card">
          <p className="section-heading__eyebrow">Register</p>
          <h1>Create Your Travel Account</h1>
          <p>
            Registration creates a real `User` domain entity with its own wishlist,
            cart and session lifecycle.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              required
            />
            <input
              type="email"
              placeholder="E-mail Address"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              required
            />
            {localError ? <p className="form-error">{localError}</p> : null}
            <button className="button button--primary" type="submit">
              Create Account
            </button>
          </form>
          <p className="auth-card__footer">
            Already registered? <Link to="/login">Login here</Link>
          </p>
        </div>

        <aside className="auth-card auth-card--muted">
          <h2>Why This Matters</h2>
          <ul className="feature-bullets">
            <li>Wishlist and cart are owned by the User class, not by view state.</li>
            <li>Routes react to the active AuthSession and the current role.</li>
            <li>Bookings become validated domain objects before they reach the cart.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
};
