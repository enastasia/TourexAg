interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) => (
  <div className={`section-heading section-heading--${align} ${className}`.trim()}>
    {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
    <h2>{title}</h2>
    {description ? <p className="section-heading__description">{description}</p> : null}
  </div>
);
