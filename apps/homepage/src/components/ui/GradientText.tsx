import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export function GradientText({ children, className, from = "#4F8EF7", to = "#8B5CF6" }: Props) {
  return (
    <span
      className={cn("gradient-text", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {children}
    </span>
  );
}
