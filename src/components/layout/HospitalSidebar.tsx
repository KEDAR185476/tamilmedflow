import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, Users, Wrench, Activity, Stethoscope,
  HeartPulse, BarChart3, Settings, Hospital, FileBarChart, AlertTriangle,
  Database, Zap, History, Brain, Boxes, Sparkles, Award, Shield,
  ChevronRight, Gauge, Workflow, Siren, Cog, TrendingUp, Pill, Map as MapIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type NavCategory = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[] };

const CATEGORIES: NavCategory[] = [
  {
    id: "overview", label: "Overview", icon: Gauge,
    items: [
      { title: "Executive Dashboard", url: "/hospital", icon: LayoutDashboard },
      { title: "Daily Summary", url: "/hospital/analytics", icon: TrendingUp },
      { title: "Alerts Center", url: "/hospital/alerts", icon: AlertTriangle },
      { title: "KPI Snapshot", url: "/hospital/reports", icon: FileBarChart },
    ],
  },
  {
    id: "operations", label: "Operations", icon: Workflow,
    items: [
      { title: "Beds & Capacity", url: "/hospital/beds", icon: BedDouble },
      { title: "Patient Flow", url: "/hospital/patients", icon: Stethoscope },
      { title: "ICU Monitor", url: "/hospital/icu", icon: HeartPulse },
      { title: "Doctor Intake Console", url: "/hospital/data", icon: Activity },
    ],
  },
  {
    id: "resources", label: "Resources", icon: Boxes,
    items: [
      { title: "Workforce Management", url: "/hospital/staff", icon: Users },
      { title: "Equipment Control", url: "/hospital/equipment", icon: Wrench },
      { title: "Medicine Intelligence", url: "/hospital/medicine", icon: Pill },
      { title: "Supply Chain Map", url: "/hospital/medicine-supply", icon: MapIcon },
      { title: "Resource Optimizer", url: "/hospital/resources", icon: Boxes },
      { title: "Automation Engine", url: "/hospital/automation", icon: Zap },
    ],
  },
  {
    id: "intelligence", label: "Intelligence", icon: Brain,
    items: [
      { title: "AI Recommendations", url: "/hospital/learning", icon: Brain },
      { title: "Insurance Intelligence", url: "/hospital/insurance", icon: Shield },
      { title: "ROI & Efficiency", url: "/hospital/roi", icon: Award },
      { title: "Historical Trends", url: "/hospital/history", icon: History },
      { title: "Reports & Exports", url: "/hospital/reports", icon: FileBarChart },
    ],
  },
  {
    id: "emergency", label: "Emergency", icon: Siren,
    items: [
      { title: "Alerts Command", url: "/hospital/alerts", icon: AlertTriangle },
      { title: "Digital Twin", url: "/hospital/twin", icon: Sparkles },
      { title: "Incident Logs", url: "/hospital/history", icon: History },
    ],
  },
  {
    id: "admin", label: "Administration", icon: Cog,
    items: [
      { title: "Hospital Profile", url: "/hospital/settings", icon: Hospital },
      { title: "Data Input Center", url: "/hospital/data", icon: Database },
      { title: "Insurance Sources", url: "/hospital/insurance-sources", icon: Shield },
      { title: "Settings", url: "/hospital/settings", icon: Settings },
    ],
  },
];

export function HospitalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const activeCategory = CATEGORIES.find(c =>
    c.items.some(i => i.url === "/hospital" ? location.pathname === "/hospital" : location.pathname.startsWith(i.url))
  )?.id ?? "overview";

  const [openId, setOpenId] = useState<string>(activeCategory);

  const isItemActive = (url: string) =>
    url === "/hospital" ? location.pathname === "/hospital" : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-3 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-chart-2/10 flex items-center justify-center ring-1 ring-chart-2/20">
            <Hospital className="h-4 w-4 text-chart-2" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground tracking-tight">My Hospital</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">Enterprise OS</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {CATEGORIES.map((cat) => {
          const isOpen = openId === cat.id;
          const hasActive = cat.items.some(i => isItemActive(i.url));

          if (collapsed) {
            // Icon-only mode: render items flat with tooltips
            return (
              <SidebarGroup key={cat.id} className="py-0.5">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {cat.items.map(item => (
                      <SidebarMenuItem key={`${cat.id}-${item.title}`}>
                        <SidebarMenuButton asChild isActive={isItemActive(item.url)} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="h-3.5 w-3.5" />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <SidebarGroup key={cat.id} className="py-0.5">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? "" : cat.id)}
                className={cn(
                  "group w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all",
                  isOpen ? "text-foreground bg-muted/40" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/20",
                  hasActive && !isOpen && "text-chart-2"
                )}
              >
                <span className="flex items-center gap-2">
                  <cat.icon className={cn("h-3.5 w-3.5", hasActive && "text-chart-2")} />
                  {cat.label}
                </span>
                <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-90")} />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <SidebarGroupContent className="pt-1 pl-2">
                    <SidebarMenu className="border-l border-border/40 pl-1.5 gap-0.5">
                      {cat.items.map(item => {
                        const active = isItemActive(item.url);
                        return (
                          <SidebarMenuItem key={`${cat.id}-${item.title}`}>
                            <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                              <Link
                                to={item.url}
                                className={cn(
                                  "relative group/item",
                                  active && "before:absolute before:left-[-7px] before:top-1.5 before:bottom-1.5 before:w-[2px] before:rounded-full before:bg-chart-2 before:shadow-[0_0_8px_oklch(0.75_0.15_190/0.6)]"
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5" />
                                <span className="text-[12.5px]">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </div>
              </div>
            </SidebarGroup>
          );
        })}

        <div className="mt-2 pt-2 border-t border-border/40">
          <SidebarGroup className="py-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Switch to Regional Intelligence">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                      <Activity className="h-3.5 w-3.5" />
                      <span className="text-[12px]">Regional Mode</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Analytics Lab">
                    <Link to="/hospital/analytics" className="text-muted-foreground hover:text-foreground">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="text-[12px]">Analytics Lab</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
