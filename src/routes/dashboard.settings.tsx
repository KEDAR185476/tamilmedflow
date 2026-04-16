import { createFileRoute } from "@tanstack/react-router";
import { WireframeZone } from "@/components/layout/WireframeZone";
import { User, Cog, Plug } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">System configuration, user profile, and API connections</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WireframeZone title="User Profile" subtitle="Name, role, hospital assignment, preferences" icon={<User className="h-8 w-8" />} minHeight="280px" />
        <WireframeZone title="System Configuration" subtitle="Thresholds, alert rules, display settings" icon={<Cog className="h-8 w-8" />} minHeight="280px" />
        <WireframeZone title="API Connections" subtitle="HMIS, NHP, FastAPI backend status" icon={<Plug className="h-8 w-8" />} minHeight="280px" />
      </div>
    </div>
  );
}
