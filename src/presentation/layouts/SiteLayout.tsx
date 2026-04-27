import { Outlet } from 'react-router-dom';
import { FlashBanner } from '../components/common/FlashBanner';
import { ScrollManager } from '../components/common/ScrollManager';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { SideDrawer } from '../components/layout/SideDrawer';

export const SiteLayout = () => (
  <>
    <ScrollManager />
    <Header />
    <FlashBanner />
    <SideDrawer />
    <main className="page-shell">
      <Outlet />
    </main>
    <Footer />
    <button
      type="button"
      className="scroll-top-button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  </>
);
