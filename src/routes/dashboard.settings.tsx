import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useState } from "react";
import {
  Settings, Building2, Bell, Brain, Zap, Shield, Clock,
  Moon, Sparkles, User, Network, AlertTriangle, Save,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [aiThreshold, setAiThreshold] = useState(75);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [motionIntensity, setMotionIntensity] = useState<"full" | "reduced" | "off">("full");
  const [emergencyEscalation, setEmergencyEscalation] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings &amp; Governance
          </h1>
          <p className="text-sm text-muted-foreground">System configuration, security, and operational governance</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:glow-lg transition-all"
        >
          {saved ? <><CheckCircle className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Profile */}
        <GlassCard className="p-5">
          <SectionHeader icon={Building2} title="Hospital Profile" />
          <div className="space-y-3 mt-4">
            <SettingField label="Hospital Name" value="Government General Hospital, Chennai" />
            <SettingField label="HMIS Code" value="TN-CHN-GGH-001" />
            <SettingField label="District" value="Chennai" />
            <SettingField label="Network Region" value="Chennai Metropolitan Area" />
            <SettingField label="Total Bed Capacity" value="2,400" />
          </div>
        </GlassCard>

        {/* Role & Access */}
        <GlassCard className="p-5">
          <SectionHeader icon={User} title="Current User Profile" />
          <div className="space-y-3 mt-4">
            <SettingField label="Role" value="Hospital Admin" />
            <SettingField label="Access Level" value="Full Dashboard + Settings + Exports" />
            <SettingField label="Last Login" value={new Date().toLocaleString()} />
            <div className="text-xs text-muted-foreground mt-2 p-2 rounded bg-primary/5 border border-primary/10">
              <strong className="text-primary">Roles:</strong> Super Admin · Hospital Admin · Operations Manager · Doctor · Nurse Supervisor · Emergency Coordinator · Analyst Viewer
            </div>
          </div>
        </GlassCard>

        {/* AI Configuration */}
        <GlassCard className="p-5">
          <SectionHeader icon={Brain} title="AI Configuration" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-muted-foreground">AI Confidence Threshold: {aiThreshold}%</label>
              <input type="range" min={50} max={99} value={aiThreshold} onChange={e => setAiThreshold(+e.target.value)}
                className="w-full mt-1 accent-primary" />
              <p className="text-[10px] text-muted-foreground">Recommendations below this threshold show a warning badge</p>
            </div>
            <ToggleSetting label="Auto-Optimize Mode" description="Allow AI to automatically assign beds and route resources" value={autoOptimize} onChange={setAutoOptimize} />
            <ToggleSetting label="Manual Override Mode" description="Require manual approval for all AI recommendations" value={!autoOptimize} onChange={v => setAutoOptimize(!v)} />
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-5">
          <SectionHeader icon={Bell} title="Notification Rules" />
          <div className="space-y-4 mt-4">
            <ToggleSetting label="ICU Overload Alerts" description="Trigger when ICU occupancy > 85%" value={true} onChange={() => {}} />
            <ToggleSetting label="Staffing Shortage Alerts" description="Trigger when nurse-patient ratio drops below IPHS norms" value={true} onChange={() => {}} />
            <ToggleSetting label="Equipment Maintenance Alerts" description="Notify when critical devices are overdue for maintenance" value={true} onChange={() => {}} />
            <ToggleSetting label="Discharge Delay Alerts" description="Notify when discharge-ready patients wait > 4 hours" value={true} onChange={() => {}} />
          </div>
        </GlassCard>

        {/* Emergency Escalation */}
        <GlassCard className="p-5">
          <SectionHeader icon={AlertTriangle} title="Emergency Escalation" />
          <div className="space-y-4 mt-4">
            <ToggleSetting label="Auto-Escalation" description="Automatically trigger Emergency Mode when risk level reaches Critical" value={emergencyEscalation} onChange={setEmergencyEscalation} />
            <SettingField label="Escalation Chain" value="Ward Head → Ops Manager → Hospital Admin → District Coordinator" />
            <SettingField label="Response SLA" value="< 15 minutes for Critical, < 30 minutes for High" />
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard className="p-5">
          <SectionHeader icon={Shield} title="Security & Session" />
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-muted-foreground">Session Timeout: {sessionTimeout} min</label>
              <input type="range" min={5} max={120} step={5} value={sessionTimeout} onChange={e => setSessionTimeout(+e.target.value)}
                className="w-full mt-1 accent-primary" />
            </div>
            <SettingField label="Authentication" value="JWT Token (httpOnly, secure)" />
            <SettingField label="Secrets Management" value="Environment variables (encrypted at rest)" />
            <SettingField label="Audit Logging" value="All actions tracked with user ID and timestamp" />
          </div>
        </GlassCard>

        {/* Display */}
        <GlassCard className="p-5">
          <SectionHeader icon={Moon} title="Display & Motion" />
          <div className="space-y-4 mt-4">
            <SettingField label="Theme" value="Dark (System default)" />
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Motion Intensity</label>
              <div className="flex gap-2">
                {(["full", "reduced", "off"] as const).map(mode => (
                  <button key={mode} onClick={() => setMotionIntensity(mode)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${motionIntensity === mode ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
                    {mode === "full" ? "Full" : mode === "reduced" ? "Reduced" : "Off"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Network Config */}
        <GlassCard className="p-5">
          <SectionHeader icon={Network} title="District Network Config" />
          <div className="space-y-3 mt-4">
            <SettingField label="Active Districts" value="12 districts monitored" />
            <SettingField label="Transfer Corridors" value="Chennai ↔ Coimbatore, Madurai ↔ Tiruchirappalli, Salem ↔ Vellore" />
            <SettingField label="Data Sync Interval" value="Every 5 minutes (simulated)" />
            <p className="text-[10px] text-muted-foreground mt-2">
              Production: Real-time HMIS feeds via HL7 FHIR integration
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Audit log sample */}
      <GlassCard className="p-5">
        <SectionHeader icon={Clock} title="Recent Audit Log" />
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {[
            { time: "10:32:15", user: "Admin", action: "Auto Optimize triggered", module: "Capacity" },
            { time: "10:28:44", user: "Admin", action: "Emergency Mode activated", module: "Emergency" },
            { time: "10:15:02", user: "Dr. Priya", action: "Patient intake reviewed", module: "Intake" },
            { time: "09:45:30", user: "System", action: "ICU threshold alert generated", module: "ICU" },
            { time: "09:30:00", user: "System", action: "Daily Occupancy Report exported", module: "Reports" },
            { time: "08:00:00", user: "System", action: "Shift rotation completed", module: "Workforce" },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-mono">
              <span className="text-muted-foreground/50 w-16">{log.time}</span>
              <span className="text-primary w-20">{log.user}</span>
              <span className="text-foreground flex-1">{log.action}</span>
              <span className="text-muted-foreground bg-primary/5 px-2 py-0.5 rounded text-[10px]">{log.module}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground text-right">{value}</span>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? "left-5.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
