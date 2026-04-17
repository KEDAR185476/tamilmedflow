import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell, Search, User, Globe, Hospital, Plus, BedDouble, Zap,
  Siren, FileBarChart, ChevronDown, Command, Stethoscope, Shield,
  Award, Brain, Sparkles, Wrench, Boxes, AlertTriangle, BarChart3,
  Database, HeartPulse, Settings, History, Users,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LatencyMonitor } from "@/components/layout/LatencyMonitor";
import { cn } from "@/lib/utils";

type SearchEntry = { label: string; hint: string; url: string; icon: React.ComponentType<{ className?: string }>; keywords: string };

const SEARCH_INDEX: SearchEntry[] = [
  { label: "Beds & Capacity", hint: "Operations", url: "/hospital/beds", icon: BedDouble, keywords: "bed icu capacity ward occupancy" },
  { label: "Patient Flow", hint: "Operations", url: "/hospital/patients", icon: Stethoscope, keywords: "patient admission discharge flow queue" },
  { label: "ICU Monitor", hint: "Operations", url: "/hospital/icu", icon: HeartPulse, keywords: "icu critical ventilator" },
  { label: "Equipment Control", hint: "Resources", url: "/hospital/equipment", icon: Wrench, keywords: "equipment ventilator monitor maintenance asset" },
  { label: "Workforce Management", hint: "Resources", url: "/hospital/staff", icon: Users, keywords: "staff doctor nurse shift workforce" },
  { label: "Resource Optimizer", hint: "Resources", url: "/hospital/resources", icon: Boxes, keywords: "optimize reallocate idle utilization" },
  { label: "Automation Engine", hint: "Resources", url: "/hospital/automation", icon: Zap, keywords: "automation workflow rules" },
  { label: "AI Recommendations", hint: "Intelligence", url: "/hospital/learning", icon: Brain, keywords: "ai recommendation prediction insight" },
  { label: "Insurance Intelligence", hint: "Intelligence", url: "/hospital/insurance", icon: Shield, keywords: "insurance scheme pmjay cmchis ayushman coverage" },
  { label: "ROI Dashboard", hint: "Intelligence", url: "/hospital/roi", icon: Award, keywords: "roi savings cost efficiency executive" },
  { label: "Historical Trends", hint: "Intelligence", url: "/hospital/history", icon: History, keywords: "history trends past data" },
  { label: "Reports & Exports", hint: "Intelligence", url: "/hospital/reports", icon: FileBarChart, keywords: "report export pdf csv summary" },
  { label: "Alerts Center", hint: "Emergency", url: "/hospital/alerts", icon: AlertTriangle, keywords: "alert warning critical notification" },
  { label: "Digital Twin", hint: "Emergency", url: "/hospital/twin", icon: Sparkles, keywords: "digital twin simulation scenario" },
  { label: "Hospital Profile", hint: "Admin", url: "/hospital/settings", icon: Hospital, keywords: "profile settings hospital configuration" },
  { label: "Data Input Center", hint: "Admin", url: "/hospital/data", icon: Database, keywords: "data input intake source" },
  { label: "Analytics Lab", hint: "Overview", url: "/hospital/analytics", icon: BarChart3, keywords: "analytics chart kpi metric" },
];

const QUICK_ACTIONS = [
  { label: "Add Patient", icon: Plus, url: "/hospital/patients" },
  { label: "Update Beds", icon: BedDouble, url: "/hospital/beds" },
  { label: "Run Optimization", icon: Zap, url: "/hospital/resources" },
  { label: "Trigger Emergency", icon: Siren, url: "/hospital/alerts" },
  { label: "Export Report", icon: FileBarChart, url: "/hospital/reports" },
];

export function HospitalTopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHospital = location.pathname.startsWith("/hospital");

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_INDEX.slice(0, 6);
    return SEARCH_INDEX.filter(e =>
      e.label.toLowerCase().includes(q) || e.keywords.includes(q) || e.hint.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const goTo = (url: string) => {
    setSearchOpen(false);
    setActionsOpen(false);
    setQuery("");
    navigate({ to: url });
  };

  return (
    <header className="h-12 flex items-center justify-between border-b border-border/60 px-3 bg-card/40 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

        {/* Hospital identity */}
        <div className="hidden md:flex items-center gap-2 pr-3 border-r border-border/40">
          <div className="h-6 w-6 rounded bg-chart-2/10 flex items-center justify-center ring-1 ring-chart-2/20">
            <Hospital className="h-3 w-3 text-chart-2" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11.5px] font-semibold text-foreground">Apollo Chennai</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Tier-1 · Operational</span>
          </div>
        </div>

        {/* Mode switch */}
        <div className="flex items-center bg-muted/40 rounded-md p-0.5 border border-border/50">
          <Link to="/dashboard"
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
              !isHospital ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Globe className="h-3 w-3" /> Regional
          </Link>
          <Link to="/hospital"
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
              isHospital ? "bg-chart-2/15 text-chart-2" : "text-muted-foreground hover:text-foreground")}>
            <Hospital className="h-3 w-3" /> My Hospital
          </Link>
        </div>

        {/* Global search */}
        <div ref={searchRef} className="relative hidden lg:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 border border-border/60 rounded-md px-2.5 py-1.5 bg-muted/20 hover:bg-muted/40 hover:border-border transition-colors w-64 text-left"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground flex-1">Search modules, ROI, ICU…</span>
            <kbd className="hidden xl:inline-flex items-center gap-0.5 text-[9px] text-muted-foreground/70 border border-border/50 rounded px-1 py-0.5">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {searchOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-[420px] bg-popover/95 backdrop-blur-xl border border-border/80 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any module, KPI, or feature…"
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
                />
                <span className="text-[9px] text-muted-foreground/70">{results.length} results</span>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {results.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">No matches found</div>
                ) : (
                  results.map((r) => (
                    <button key={`${r.url}-${r.label}`} onClick={() => goTo(r.url)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-accent/60 transition-colors text-left">
                      <div className="h-7 w-7 rounded bg-muted/60 flex items-center justify-center shrink-0">
                        <r.icon className="h-3.5 w-3.5 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-foreground truncate">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.hint}</div>
                      </div>
                      <ChevronDown className="h-3 w-3 -rotate-90 text-muted-foreground/60" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5">
        {/* Quick Actions */}
        <div ref={actionsRef} className="relative">
          <button
            onClick={() => setActionsOpen(v => !v)}
            className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors",
              actionsOpen ? "bg-chart-2/15 text-chart-2 border-chart-2/30" : "bg-muted/30 border-border/60 text-foreground hover:bg-muted/50")}
          >
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Quick Actions</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", actionsOpen && "rotate-180")} />
          </button>
          {actionsOpen && (
            <div className="absolute top-full mt-1.5 right-0 w-56 bg-popover/95 backdrop-blur-xl border border-border/80 rounded-lg shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground/70 border-b border-border/40">
                Operator shortcuts
              </div>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => goTo(a.url)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-accent/60 transition-colors text-left text-[12px] text-foreground">
                  <a.icon className="h-3.5 w-3.5 text-chart-2" />
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <LatencyMonitor />

        <button className="relative p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Notifications">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        </button>

        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border/40">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-chart-2/30 to-chart-2/10 flex items-center justify-center border border-chart-2/30">
            <User className="h-3.5 w-3.5 text-chart-2" />
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-[11px] font-medium text-foreground">Dr. R. Kumar</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Hospital Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
