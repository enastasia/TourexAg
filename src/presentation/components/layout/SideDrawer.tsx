import {
  Globe,
  Image,
  MapPin,
  Plane,
  PhoneCall,
  Play,
  Send,
  X,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const SideDrawer = () => {
  const {
    state: { isMenuOpen },
    store,
  } = useAppStore();

  return (
    <>
      <button
        type="button"
        className={`side-drawer__backdrop ${isMenuOpen ? 'is-open' : ''}`}
        onClick={() => store.toggleMenu(false)}
        aria-label="Close menu"
      />
      <aside className={`side-drawer ${isMenuOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="side-drawer__close"
          onClick={() => store.toggleMenu(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <div className="site-logo site-logo--drawer">
          <span className="site-logo__pin">
            <Plane size={26} />
          </span>
          <span>
            Tourex
            <small>A Travel Agency</small>
          </span>
        </div>
        <div className="side-drawer__section">
          <h3>Office Address</h3>
          <p>123/A, Miranda City Likaoli</p>
          <p>Prikano, Dope</p>
        </div>
        <div className="side-drawer__section">
          <h3>Phone Number</h3>
          <p>
            <PhoneCall size={14} />
            +0989 7876 9865 9
          </p>
          <p>
            <PhoneCall size={14} />
            +(090) 8765 86543 85
          </p>
        </div>
        <div className="side-drawer__section">
          <h3>Email Address</h3>
          <p>
            <MapPin size={14} />
            info@example.com
          </p>
          <p>
            <Globe size={14} />
            example.mail@hum.com
          </p>
        </div>
        <div className="side-drawer__socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <Globe size={18} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <Image size={18} />
          </a>
          <a href="https://google.com" target="_blank" rel="noreferrer">
            <Send size={18} />
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noreferrer">
            <Play size={18} />
          </a>
        </div>
      </aside>
    </>
  );
};
