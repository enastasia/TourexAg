import { CheckCircle2 } from 'lucide-react';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { SectionHeading } from '../components/common/SectionHeading';
import { formatCurrency } from '../../shared/utils/formatters';
import { useAppStore } from '../hooks/useAppStore';

export const PricingPage = () => {
  const {
    state: { pricingPlans, tours },
  } = useAppStore();

  return (
    <>
      <BreadcrumbHero
        eyebrow="Flexible Travel Packages"
        title="Pricing Plan"
        image={tours[1]?.getHeroImage() ?? tours[0]?.getHeroImage() ?? ''}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'Pricing Plan' },
        ]}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Best Holiday Packages"
            title="Popular Travel Destinations Available Worldwide"
          />
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.getId()} className="pricing-card">
                <h3>{plan.getTitle()}</h3>
                <p>{plan.getDescription()}</p>
                <div className="pricing-card__price">
                  <strong>{formatCurrency(plan.getBasePrice())}</strong>
                  <span>/month *</span>
                </div>
                <button className="button button--ghost" type="button">
                  Buy Now
                </button>
                <ul>
                  {plan.getFeatures().map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
