import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  elevated?: boolean;
}

export function GlassCard({ className, glow, elevated, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/60 backdrop-blur-sm transition-all duration-200",
        elevated && "shadow-elevated",
        glow && "border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
