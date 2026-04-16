import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, Users, Wrench, GitBranch,
  AlertTriangle, FlaskConical, FileBarChart, Settings, Activity, Stethoscope, Gauge,
  Database, Terminal, Brain, Eye, Lightbulb, MapPin,
  HeartPulse, Navigation, Building2, Shield, BarChart3, Siren,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Capacity Command", url: "/dashboard/capacity", icon: Activity },
  { title: "Bed Allocation", url: "/dashboard/bed-allocation", icon: BedDouble },
  { title: "ICU Operations", url: "/dashboard/icu-operations", icon: HeartPulse },
  { title: "Resource Routing", url: "/dashboard/resource-routing", icon: Navigation },
  { title: "Workforce", url: "/dashboard/workforce", icon: Users },
  { title: "Equipment", url: "/dashboard/equipment", icon: Wrench },
  { title: "Patient Flow", url: "/dashboard/patient-flow", icon: GitBranch },
  { title: "Intake Briefing", url: "/dashboard/intake", icon: Stethoscope },
  { title: "Efficiency", url: "/dashboard/efficiency", icon: Gauge },
  { title: "Emergency Mode", url: "/dashboard/emergency", icon: Siren },
  { title: "Simulation Lab", url: "/dashboard/simulation", icon: FlaskConical },
  { title: "Digital Twin", url: "/dashboard/twin", icon: Building2 },
  { title: "Crisis Planning", url: "/dashboard/crisis", icon: Shield },
  { title: "Impact Analyzer", url: "/dashboard/impact", icon: BarChart3 },
];

const aiItems = [
  { title: "Forecast Intelligence", url: "/dashboard/forecast", icon: Brain },
  { title: "AI Transparency Lab", url: "/dashboard/ai-transparency", icon: Eye },
  { title: "Recommendations", url: "/dashboard/recommendations", icon: Lightbulb },
  { title: "District Predictions", url: "/dashboard/district-predictions", icon: MapPin },
];

const systemItems = [
  { title: "Data Transparency", url: "/dashboard/data-transparency", icon: Database },
  { title: "Reports & Exports", url: "/dashboard/reports", icon: FileBarChart },
  { title: "Settings & Governance", url: "/dashboard/settings", icon: Settings },
  { title: "System Operations", url: "/dashboard/admin", icon: Terminal },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-3 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-foreground tracking-tight">MedFlow</span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">Nexus</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => <NavItem key={item.title} item={item} pathname={location.pathname} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => <NavItem key={item.title} item={item} pathname={location.pathname} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => <NavItem key={item.title} item={item} pathname={location.pathname} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function NavItem({ item, pathname }: { item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }; pathname: string }) {
  const isActive = pathname === item.url ||
    (item.url !== "/dashboard" && pathname.startsWith(item.url));
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.url}>
          <item.icon className="h-3.5 w-3.5" />
          <span className="text-[13px]">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
