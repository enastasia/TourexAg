import { LogOut, Menu, PhoneCall, Plane, ShoppingCart, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Admin } from '../../../domain/people/Admin';
import { User } from '../../../domain/people/User';
import { useAppStore } from '../../hooks/useAppStore';

export const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    state: { currentCart, currentPerson },
    store,
  } = useAppStore();

  const overlayHeader = true;
  const isAdmin = currentPerson instanceof Admin;

  const cartCount = currentPerson instanceof User ? currentCart?.getItemsCount() ?? 0 : 0;
  const accountHref = isAdmin ? '/admin' : '/account';
  const accountLabel = currentPerson ? 'Account' : 'Login';
  const handleLogout = () => {
    store.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className={`site-header ${overlayHeader ? 'site-header--overlay' : ''}`}>
      <div className="container site-header__inner">
        <Link className="site-logo" to="/">
          <span className="site-logo__pin">
            <Plane size={26} />
          </span>
          <span>
            Tourex
            <small>A Travel Agency</small>
          </span>
        </Link>

        <nav className="site-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tours">Tour Grid</NavLink>
          {!isAdmin && <NavLink to="/wishlist">Wishlist</NavLink>}
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="site-header__actions">
          <a className="site-header__call" href="tel:+123595966">
            <PhoneCall size={18} />
            <span>
              Call Us:
              <strong>+123 5959 66</strong>
            </span>
          </a>
          {!isAdmin && (
            <button
              type="button"
              className="icon-button"
              onClick={() => navigate('/cart')}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 ? <span className="badge-pill">{cartCount}</span> : null}
            </button>
          )}
          <button
            type="button"
            className="header-account-button"
            onClick={() => navigate(accountHref)}
          >
            <UserRound size={16} />
            {accountLabel}
          </button>
          {currentPerson ? (
            <button
              type="button"
              className="header-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : null}
          <button
            type="button"
            className="icon-button icon-button--burger"
            onClick={() => store.toggleMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
