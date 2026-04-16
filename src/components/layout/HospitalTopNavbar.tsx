import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Search, User, Globe, Hospital } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function HospitalTopNavbar() {
  const location = useLocation();
  const isHospital = location.pathname.startsWith("/hospital");

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 glass-strong">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        {/* Mode Switcher */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
          <Link to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${!isHospital ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Globe className="h-3 w-3" /> Regional
          </Link>
          <Link to="/hospital"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${isHospital ? "bg-chart-2 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Hospital className="h-3 w-3" /> My Hospital
          </Link>
        </div>
        <div className="hidden lg:flex items-center gap-2 glass rounded-lg px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="h-8 w-8 rounded-full bg-chart-2/20 flex items-center justify-center">
          <User className="h-4 w-4 text-chart-2" />
        </div>
      </div>
    </header>
  );
}
