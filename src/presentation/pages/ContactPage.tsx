import { MapPin, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { BreadcrumbHero } from '../components/common/BreadcrumbHero';
import { useAppStore } from '../hooks/useAppStore';

export const ContactPage = () => {
  const {
    state: { tours },
  } = useAppStore();
  const [sent, setSent] = useState(false);

  return (
    <>
      <BreadcrumbHero
        eyebrow="Get In Touch"
        title="Contact With Us"
        image={tours[2]?.getHeroImage() ?? tours[0]?.getHeroImage() ?? ''}
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pages' },
          { label: 'Contact' },
        ]}
      />

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-card">
            <h2>Information:</h2>
            <p>
              Brendan Fraser, renowned actor of the silver screen, has taken on a new
              role as a tour guide, leveraging his passion for adventure.
            </p>
            <div className="contact-card__info">
              <p>
                <PhoneCall size={16} />
                Phone: +123 9998 000
              </p>
              <p>
                <MapPin size={16} />
                Website: www.info.com
              </p>
              <p>
                <MapPin size={16} />
                E-Mail: info@gmail.com
              </p>
              <p>
                <MapPin size={16} />
                Address: 1426 California, USA
              </p>
            </div>
            <iframe
              title="New York"
              src="https://www.google.com/maps?q=40.7128,-74.006&z=11&output=embed"
              loading="lazy"
            />
          </div>

          <div className="contact-form-card">
            <h2>Let&apos;s Connect And Get To Know Each Other</h2>
            <p>
              A simple contact form for the visual reference. It stores no data and does
              not pollute the domain layer with non-domain concerns.
            </p>
            <form
              className="contact-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <div className="contact-form__row">
                <input type="text" placeholder="Name" required />
                <input type="email" placeholder="E-mail" required />
              </div>
              <input type="url" placeholder="Website" />
              <textarea placeholder="Comments" required />
              <label className="contact-form__checkbox">
                <input type="checkbox" />
                Save My Name, Email, And Website In This Browser For The Next Time I Comment.
              </label>
              <button className="button button--primary" type="submit">
                Send Message
              </button>
              {sent ? (
                <p className="contact-form__success">Message prepared successfully.</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
