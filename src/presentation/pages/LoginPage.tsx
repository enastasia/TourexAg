import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SEED_CREDENTIALS } from '../../infrastructure/data/seedIds';
import { useAppStore } from '../hooks/useAppStore';

export const LoginPage = () => {
  const { store } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>(SEED_CREDENTIALS.traveler.email);
  const [password, setPassword] = useState<string>(SEED_CREDENTIALS.traveler.password);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = store.login({
      email,
      password,
    });

    if (result.success) {
      const nextPath =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        (result.data?.getRole() === 'admin' ? '/admin' : '/account');

      navigate(nextPath, { replace: true });
    }
  };

  return (
    <section className="section auth-section">
      <div className="container auth-grid">
        <div className="auth-card">
          <p className="section-heading__eyebrow">Login</p>
          <h1>Welcome Back To Tourex</h1>
          <p>Use one of the seeded accounts below or create a new traveler profile.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="button button--primary" type="submit">
              Login
            </button>
          </form>
          <p className="auth-card__footer">
            No account yet? <Link to="/register">Register here</Link>
          </p>
        </div>

        <aside className="auth-card auth-card--muted">
          <h2>Demo Credentials</h2>
          <div className="credentials-list">
            <article>
              <strong>Traveler</strong>
              <span>{SEED_CREDENTIALS.traveler.email}</span>
              <span>{SEED_CREDENTIALS.traveler.password}</span>
            </article>
            <article>
              <strong>Admin</strong>
              <span>{SEED_CREDENTIALS.admin.email}</span>
              <span>{SEED_CREDENTIALS.admin.password}</span>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
};
