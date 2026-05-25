import { Award, Luggage, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { SectionHeading } from '../components/common/SectionHeading';
import { useAppStore } from '../hooks/useAppStore';

export const AboutPage = () => {
  const { store } = useAppStore();
  const tours = store.getPopularTours(4);

  return (
    <>
      <BreadcrumbHero
        eyebrow="Who We Are"
        title="About Us"
        image={tours[0]?.getHeroImage() ?? tours[0]?.getCardImage() ?? ''}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'About Us' },
        ]}
      />

      <section className="section">
        <div className="container about-intro">
          <div className="about-intro__collage">
            <img src={tours[0]?.getCardImage()} alt="Travel" />
            <img src={tours[1]?.getCardImage()} alt="Travel" />
            <img src={tours[2]?.getCardImage()} alt="Travel" />
          </div>
          <div className="about-intro__content">
            <p className="section-heading__eyebrow">Explore The World With Us</p>
            <h2>The Perfect Vacation Come True With Our Travel Agency</h2>
            <p>
              This project intentionally keeps domain logic outside TSX. Tours,
              pricing, reviews, wishlist and booking behavior are all backed by real
              classes and interfaces rather than ad-hoc page state.
            </p>
            <Link className="button button--primary" to="/pricing">
              Book Your Room
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="What We Do"
            title="We Arrange The Best Tour Ever Possible"
            description="Three focused promises that mirror the reference while still reflecting the actual architecture decisions."
          />
          <div className="feature-card-grid">
            <article className="feature-card">
              <WalletCards size={26} />
              <h3>Ultimate flexibility</h3>
              <p>
                Search criteria, filters and pricing plans are modeled as separate classes,
                not page-local blobs.
              </p>
            </article>
            <article className="feature-card">
              <Luggage size={26} />
              <h3>Memorable experiences</h3>
              <p>
                Tour subclasses override pricing and marketing behavior while staying
                compatible with the shared Tour API.
              </p>
            </article>
            <article className="feature-card">
              <Award size={26} />
              <h3>Award winning support</h3>
              <p>
                Roles, permissions and admin management live inside the domain and
                application layers, not inside route guards alone.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
};
