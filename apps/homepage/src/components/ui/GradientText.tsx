import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ children, className, from = "#00f5d4", to = "#7b61ff" }: Props) {
  return (
    <span
      className={cn("gradient-text", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {children}
    </span>
  );
}
