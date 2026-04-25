import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../hooks/useAppStore';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'admin' | 'user';
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const {
    state: { currentPerson },
  } = useAppStore();
  const location = useLocation();

  if (!currentPerson) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && currentPerson.getRole() !== role) {
    return (
      <Navigate
        to={currentPerson.getRole() === 'admin' ? '/admin' : '/account'}
        replace
      />
    );
  }

  return <>{children}</>;
};
