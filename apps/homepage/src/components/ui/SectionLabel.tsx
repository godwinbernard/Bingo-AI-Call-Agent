interface Props {
  children: React.ReactNode;
  color?: "teal" | "purple" | "red";
}

const COLOR_MAP = {
  teal: { bg: "rgba(0,245,212,0.1)", border: "rgba(0,245,212,0.3)", text: "#00f5d4" },
  purple: { bg: "rgba(123,97,255,0.1)", border: "rgba(123,97,255,0.3)", text: "#7b61ff" },
  red: { bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)", text: "#ff6b6b" },
};

export function SectionLabel({ children, color = "teal" }: Props) {
  const c = COLOR_MAP[color];
  return (
    <span
      className="section-label"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      {children}
    </span>
  );
}
