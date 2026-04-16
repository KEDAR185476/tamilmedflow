import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, Users, Wrench, Activity,
  Stethoscope, HeartPulse, BarChart3, Settings, Hospital,
  FileBarChart, AlertTriangle, Database, Zap, History, Brain, Boxes,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const hospitalNav = [
  { title: "Overview", url: "/hospital", icon: LayoutDashboard },
  { title: "Data Center", url: "/hospital/data", icon: Database },
  { title: "Bed Management", url: "/hospital/beds", icon: BedDouble },
  { title: "Staff Operations", url: "/hospital/staff", icon: Users },
  { title: "Equipment", url: "/hospital/equipment", icon: Wrench },
  { title: "Resource Optimizer", url: "/hospital/resources", icon: Boxes },
  { title: "Patient Flow", url: "/hospital/patients", icon: Stethoscope },
  { title: "ICU Monitor", url: "/hospital/icu", icon: HeartPulse },
  { title: "Alerts", url: "/hospital/alerts", icon: AlertTriangle },
  { title: "Automation", url: "/hospital/automation", icon: Zap },
  { title: "History", url: "/hospital/history", icon: History },
  { title: "Learning Lab", url: "/hospital/learning", icon: Brain },
  { title: "Analytics", url: "/hospital/analytics", icon: BarChart3 },
  { title: "Reports", url: "/hospital/reports", icon: FileBarChart },
  { title: "Settings", url: "/hospital/settings", icon: Settings },
];

export function HospitalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-3 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-chart-2/10 flex items-center justify-center">
            <Hospital className="h-4 w-4 text-chart-2" />
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-foreground tracking-tight">My Hospital</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hospitalNav.map(item => {
                const isActive = item.url === "/hospital"
                  ? location.pathname === "/hospital"
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="text-[13px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Switch</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Regional Intelligence">
                  <Link to="/dashboard">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-[13px]">Regional Mode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
