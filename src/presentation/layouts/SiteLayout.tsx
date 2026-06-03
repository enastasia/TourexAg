import { Outlet, useLocation } from 'react-router-dom';
import { FlashBanner } from '../components/common/FlashBanner';
import { ScrollManager } from '../components/common/ScrollManager';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { SideDrawer } from '../components/layout/SideDrawer';

const FOOTER_HIDDEN_PATHS = ['/cart', '/contact', '/wishlist'];
const SCROLL_TOP_HIDDEN_PATHS = ['/contact', '/cart', '/wishlist'];

export const SiteLayout = () => {
  const { pathname } = useLocation();
  const showFooter = !FOOTER_HIDDEN_PATHS.includes(pathname);
  const showScrollTop = !SCROLL_TOP_HIDDEN_PATHS.includes(pathname);

  return (
    <>
      <ScrollManager />
      <Header />
      <FlashBanner />
      <SideDrawer />
      <main className="page-shell">
        <Outlet />
      </main>
      {showFooter && <Footer />}
      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
};
