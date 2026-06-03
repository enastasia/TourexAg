import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SEED_CREDENTIALS } from '../../infrastructure/data/seedIds';
import { useAppStore } from '../hooks/useAppStore';

const loginHeroImage = '/assets/hero-slider/slide-2.jpg';

export const LoginPage = () => {
  const { store } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>(SEED_CREDENTIALS.traveler.email);
  const [password, setPassword] = useState<string>(SEED_CREDENTIALS.traveler.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');

    const result = store.login({
      email,
      password,
    });

    if (result.success) {
      const nextPath =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        (result.data?.getRole() === 'admin' ? '/admin' : '/account');

      navigate(nextPath, { replace: true });
    } else {
      setLoginError(result.error ?? 'Unable to log in.');
    }
  };

  return (
    <div className="auth-split">
      <div
        className="auth-split__hero"
        style={{ backgroundImage: `url(${loginHeroImage})` }}
      >
        <div className="auth-split__hero-overlay" />
      </div>

      <div className="auth-split__form-side">
        <div className="auth-split__form-wrapper">
          <div className="auth-split__brand">
            <Link to="/">Tourex</Link>
          </div>

          <div className="auth-split__header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          <form className="auth-split__form" onSubmit={handleSubmit}>
            <div className="auth-split__input-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder="E-mail Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="auth-split__input-group">
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

            {loginError ? <p className="form-error">{loginError}</p> : null}

            <button className="button button--primary auth-split__submit" type="submit">
              <LogIn size={18} />
              Sign In
            </button>
          </form>

          <p className="auth-split__footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>

          <Link to="/" className="auth-split__guest-link">
            Continue without an account
          </Link>
        </div>
      </div>
    </div>
  );
};
