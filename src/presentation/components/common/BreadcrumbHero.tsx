interface BreadcrumbHeroProps {
  title: string;
  image: string;
  imagePosition?: string;
  className?: string;
  eyebrow?: string;
  overlay?: 'default' | 'soft';
  crumbs: Array<{
    label: string;
    href?: string;
  }>;
}

const overlayGradient = {
  default: 'linear-gradient(180deg, rgba(8, 13, 28, 0.78), rgba(8, 13, 28, 0.34))',
  soft: 'linear-gradient(180deg, rgba(8, 13, 28, 0.24), rgba(8, 13, 28, 0.06))',
} as const;

export const BreadcrumbHero = ({
  title,
  image,
  imagePosition,
  className,
  eyebrow,
  overlay = 'default',
}: BreadcrumbHeroProps) => {
  return (
    <section
      className={`breadcrumb-hero${className ? ` ${className}` : ''}`}
      style={{
        backgroundImage: `${overlayGradient[overlay]}, url(${image})`,
        ...(imagePosition ? { backgroundPosition: imagePosition } : {}),
      }}
    >
      <div className="container breadcrumb-hero__inner">
        {eyebrow ? (
          <p className="section-heading__eyebrow breadcrumb-hero__eyebrow">{eyebrow}</p>
        ) : null}
        <h1>{title}</h1>
      </div>
    </section>
  );
};
