import { cn } from "@/lib/utils";

interface WireframeZoneProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export function WireframeZone({ title, subtitle, icon, className, minHeight = "200px" }: WireframeZoneProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-3 p-6",
        className
      )}
      style={{ minHeight }}
    >
      {icon && <div className="text-muted-foreground/40">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground/60">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground/40">{subtitle}</p>}
    </div>
  );
}
