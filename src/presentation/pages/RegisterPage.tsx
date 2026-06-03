import { Eye, EyeOff, Mail, Lock, Phone, UserPlus, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Person } from '../../domain/people/Person';
import { useAppStore } from '../hooks/useAppStore';

const registerHeroImage = '/assets/hero-slider/slide-3.jpg';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.fullName.trim().length < 3) {
      setLocalError('Full name must contain at least 3 characters.');
      return;
    }

    if (!Person.isValidEmail(form.email)) {
      setLocalError('Invalid email format. Use format: user@example.com');
      return;
    }

    if (!Person.isValidPhone(form.phone)) {
      setLocalError('Invalid phone number. Use international format with country code (e.g. +380 XX XXX XXXX).');
      return;
    }

    if (form.password.length < 4) {
      setLocalError('Password must contain at least 4 characters.');
      return;
    }

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
    } else {
      setLocalError(result.error ?? 'Unable to create account.');
    }
  };

  return (
    <div className="auth-split">
      <div
        className="auth-split__hero"
        style={{ backgroundImage: `url(${registerHeroImage})` }}
      >
        <div className="auth-split__hero-overlay" />
      </div>

      <div className="auth-split__form-side">
        <div className="auth-split__form-wrapper">
          <div className="auth-split__brand">
            <Link to="/">Tourex</Link>
          </div>

          <div className="auth-split__header">
            <h1>Create Account</h1>
            <p>Join Tourex and start planning your trips</p>
          </div>

          <form className="auth-split__form" onSubmit={handleSubmit}>
            <div className="auth-split__input-group">
              <User size={18} />
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                required
              />
            </div>

            <div className="auth-split__input-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder="E-mail Address"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>

            <div className="auth-split__input-group">
              <Phone size={18} />
              <input
                type="tel"
                placeholder="+380 XX XXX XXXX"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                required
              />
            </div>

            <div className="auth-split__input-group">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
              <button
                type="button"
                className="auth-split__toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="auth-split__input-group">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
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
            </div>

            {localError ? <p className="form-error">{localError}</p> : null}

            <button className="button button--primary auth-split__submit" type="submit">
              <UserPlus size={18} />
              Create Account
            </button>
          </form>

          <p className="auth-split__footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>

          <Link to="/" className="auth-split__guest-link">
            Continue without an account
          </Link>
        </div>
      </div>
    </div>
  );
};
