import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HospitalSidebar } from "@/components/layout/HospitalSidebar";
import { HospitalTopNavbar } from "@/components/layout/HospitalTopNavbar";

export const Route = createFileRoute("/hospital")({
  component: HospitalLayout,
});

const AUTH_ROUTES = ["/hospital/login", "/hospital/signup", "/hospital/forgot-password", "/hospital/onboarding"];

function HospitalLayout() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.some(r => location.pathname === r);

  if (isAuthPage) {
    return <Outlet />;
  }

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
