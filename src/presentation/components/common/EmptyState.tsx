import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{description}</p>
    <Link className="button button--primary" to={actionHref}>
      {actionLabel}
    </Link>
  </div>
);
