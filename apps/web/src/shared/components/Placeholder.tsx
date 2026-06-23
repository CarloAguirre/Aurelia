interface PlaceholderProps {
  title: string;
  description?: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <section>
      <h2>{title}</h2>
      {description ? <p style={{ color: '#64748b' }}>{description}</p> : null}
    </section>
  );
}
