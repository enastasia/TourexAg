import {
  Globe,
  Image,
  MapPin,
  PhoneCall,
  PinIcon,
  Play,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const linkColumns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
      { label: 'Tour Guide', href: '/tours' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Utility Pages',
    links: [
      { label: 'Pricing Plan', href: '/pricing' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
    ],
  },
];

export const Footer = () => (
  <footer className="site-footer">
    <div className="container site-footer__grid">
      <div className="site-footer__brand">
        <div className="site-logo site-logo--footer">
          <span className="site-logo__pin">9</span>
          <span>
            Tourex
            <small>A Travel Agency</small>
          </span>
        </div>
        <p>
          Pharetra maecenas felis vestibulum convallis mollis nullam congue sit.
          Rivers of finland quebec.
        </p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your mail" aria-label="Email" />
          <button type="submit">→</button>
        </form>
        <div className="site-footer__socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <Globe size={16} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <Send size={16} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <Image size={16} />
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noreferrer">
            <PinIcon size={16} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            <Play size={16} />
          </a>
        </div>
      </div>

      {linkColumns.map((column) => (
        <div key={column.title}>
          <h3>{column.title}</h3>
          <div className="site-footer__links">
            {column.links.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3>Information</h3>
        <div className="site-footer__info">
          <p>
            <MapPin size={16} />
            58 Street Commercial Road Fratton, Australia
          </p>
          <p>
            <PhoneCall size={16} />
            +123 888 9999
          </p>
          <p>
            <MapPin size={16} />
            Mon - Sat: 8 AM - 5 PM, Sunday: CLOSED
          </p>
        </div>
      </div>
    </div>
    <div className="site-footer__bottom">
      Copyright ©Tourex | All Right Reserved
    </div>
  </footer>
);
