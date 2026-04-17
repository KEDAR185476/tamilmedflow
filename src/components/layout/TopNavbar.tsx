import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Search, User, Globe, Hospital } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DistrictSelector } from "@/components/dashboard/DistrictSelector";
import { LatencyMonitor } from "@/components/layout/LatencyMonitor";

export function TopNavbar() {
  const location = useLocation();
  const isHospital = location.pathname.startsWith("/hospital");

  return (
    <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        {/* Mode Switcher */}
        <div className="flex items-center bg-muted/40 rounded-md p-0.5 border border-border/50">
          <Link to="/dashboard"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${!isHospital ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Globe className="h-3 w-3" /> Regional
          </Link>
          <Link to="/hospital"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${isHospital ? "bg-chart-2/15 text-chart-2" : "text-muted-foreground hover:text-foreground"}`}>
            <Hospital className="h-3 w-3" /> My Hospital
          </Link>
        </div>
        <DistrictSelector />
        <div className="hidden lg:flex items-center gap-2 border border-border/50 rounded-md px-2.5 py-1.5 bg-muted/20">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search..."
            className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LatencyMonitor />
        <button className="relative p-1.5 rounded-md hover:bg-accent transition-colors">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>
        <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center border border-border/50">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
