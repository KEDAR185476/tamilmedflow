import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HospitalSidebar } from "@/components/layout/HospitalSidebar";
import { HospitalTopNavbar } from "@/components/layout/HospitalTopNavbar";

export const Route = createFileRoute("/hospital")({
  component: HospitalLayout,
});

function HospitalLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <HospitalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <HospitalTopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
