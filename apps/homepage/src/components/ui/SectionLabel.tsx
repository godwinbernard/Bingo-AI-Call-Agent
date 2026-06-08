interface Props {
  children: React.ReactNode;
  color?: string;
}

export function SectionLabel({ children }: Props) {
  return <span className="section-label">{children}</span>;
}
