import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  className?: string;
  size?: "default" | "large";
}

export function KPICard({ title, value, trend, trendUp, icon, className, size = "default" }: KPICardProps) {
  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 transition-all duration-200 hover:bg-card/70 hover:border-border/80",
        isLarge && "p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className={cn(
          "text-muted-foreground font-medium tracking-tight",
          isLarge ? "text-xs" : "text-[11px]",
        )}>
          {title}
        </p>
        <div className="text-muted-foreground/60">{icon}</div>
      </div>
      <p className={cn(
        "font-semibold text-foreground tracking-tight",
        isLarge ? "text-3xl" : "text-xl",
      )}>
        {value}
      </p>
      {trend && (
        <p className={cn(
          "text-[11px] mt-1.5 font-medium",
          trendUp ? "text-success" : "text-destructive",
        )}>
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      )}
    </div>
  );
}
