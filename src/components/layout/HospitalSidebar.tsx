import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, Users, Wrench, Activity,
  Stethoscope, HeartPulse, BarChart3, Settings, Hospital,
  FileBarChart, AlertTriangle, Database, Zap, History, Brain,
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
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-2/20 flex items-center justify-center" style={{ boxShadow: "0 0 10px oklch(0.70 0.12 160 / 40%)" }}>
            <Hospital className="h-5 w-5 text-chart-2" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-chart-2">My Hospital</p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">MedFlow Nexus</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hospital Ops</SidebarGroupLabel>
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Switch Mode</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Regional Intelligence">
                  <Link to="/dashboard">
                    <Activity className="h-4 w-4" />
                    <span>Regional Mode</span>
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
