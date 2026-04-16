import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, trend, trendUp, icon, className }: KPICardProps) {
  return (
    <GlassCard className={cn("flex items-start gap-4", className)}>
      <div className="rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trendUp ? "text-success" : "text-destructive")}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
