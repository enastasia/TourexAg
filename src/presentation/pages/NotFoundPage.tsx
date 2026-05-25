import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="section section--not-found">
    <div className="container not-found">
      <p className="section-heading__eyebrow">404 Error</p>
      <h1>We Lost This Route Somewhere Over The Ocean</h1>
      <p>The page you requested does not exist in the current tour map.</p>
      <Link className="button button--primary" to="/">
        Back Home
      </Link>
    </div>
  </section>
);
