import { createFileRoute, Link } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useState } from "react";
import {
  Hospital, BedDouble, Users, Wrench, Activity, CheckCircle,
  Building2, MapPin, Phone, Mail, HeartPulse, Clock, Shield,
  UserPlus, Trash2, Edit2, Lock, Database,
} from "lucide-react";
import {
  getHospitalAuth, ROLE_LABELS, type HospitalRole, ROLE_PERMISSIONS,
  clearHospitalAuth,
} from "@/lib/hospitalAuth";
import { loadHospitalData } from "@/lib/hospitalDataEngine";

export const Route = createFileRoute("/hospital/")({
  component: HospitalHome,
});

function HospitalHome() {
  const auth = getHospitalAuth();
  const [tab, setTab] = useState<"dashboard" | "users" | "audit">("dashboard");

  const [staffUsers] = useState<Array<{ id: string; name: string; email: string; role: HospitalRole; active: boolean }>>([
    { id: "1", name: "Dr. Priya Sharma", email: "priya@hospital.org", role: "doctor", active: true },
    { id: "2", name: "Nurse Lakshmi K.", email: "lakshmi@hospital.org", role: "nurse_supervisor", active: true },
    { id: "3", name: "Rajesh M.", email: "rajesh@hospital.org", role: "operations_manager", active: true },
    { id: "4", name: "Anitha V.", email: "anitha@hospital.org", role: "equipment_manager", active: true },
    { id: "5", name: "Dr. Karthik R.", email: "karthik@hospital.org", role: "emergency_coordinator", active: true },
    { id: "6", name: "Meena S.", email: "meena@hospital.org", role: "analyst_viewer", active: false },
  ]);

  // If not logged in, show gateway
  if (!auth) {
    return (
      <div className="max-w-3xl mx-auto py-16 animate-slide-up">
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-chart-2/15 flex items-center justify-center mx-auto mb-5" style={{ boxShadow: "0 0 30px oklch(0.70 0.12 160 / 30%)" }}>
            <Hospital className="h-8 w-8 text-chart-2" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">My Hospital</h1>
          <p className="text-muted-foreground mb-8">Private hospital intelligence platform. Sign in or create your workspace.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/hospital/login" className="inline-flex items-center gap-2 bg-chart-2 text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all">
              <Lock className="h-4 w-4" /> Sign In
            </Link>
            <Link to="/hospital/signup" className="inline-flex items-center gap-2 border border-chart-2/30 text-chart-2 px-6 py-3 rounded-xl font-semibold hover:bg-chart-2/10 transition-all">
              <UserPlus className="h-4 w-4" /> Create Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { tenant, user, onboarding } = auth;
  const hd = loadHospitalData(tenant.id);
  const bedCount = hd.capacity.totalBeds || onboarding?.totalBeds || 200;
  const occupied = hd.liveOps.beds.occupied || Math.round(bedCount * 0.76);



  const auditLog = [
    { time: "2 min ago", user: user.name, action: "Logged in", detail: "Session started" },
    { time: "1 hr ago", user: "Dr. Priya", action: "Patient admitted", detail: "ICU Ward B" },
    { time: "3 hr ago", user: "Rajesh M.", action: "Bed count updated", detail: "Ward A +5 beds" },
    { time: "5 hr ago", user: "System", action: "Emergency mode activated", detail: "Auto-triggered" },
    { time: "8 hr ago", user: "Anitha V.", action: "Equipment maintenance", detail: "Ventilator #7 serviced" },
    { time: "12 hr ago", user: user.name, action: "Staff roster updated", detail: "Night shift adjusted" },
    { time: "1 day ago", user: "System", action: "Report exported", detail: "Monthly occupancy PDF" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with hospital name and user info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Hospital className="h-6 w-6 text-chart-2" />
            {tenant.name || "My Hospital"}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {tenant.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {tenant.city}</span>}
            <span className="text-chart-2">•</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {ROLE_LABELS[user.role]}</span>
            <span className="text-chart-2">•</span>
            <span className="text-[10px] text-muted-foreground/60">Tenant: {tenant.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 border border-border">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <button onClick={() => { clearHospitalAuth(); window.location.reload(); }}
            className="text-xs text-destructive/70 hover:text-destructive px-3 py-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 w-fit">
        {(["dashboard", "users", "audit"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? "bg-chart-2 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "dashboard" ? "Dashboard" : t === "users" ? "Users & Roles" : "Audit Log"}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <>
          {/* Setup prompt */}
          {!hd.setupComplete && (
            <GlassCard glow className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-chart-2" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Complete Your Hospital Setup</p>
                  <p className="text-xs text-muted-foreground">Enter your operational data to unlock AI-powered dashboards and predictions.</p>
                </div>
              </div>
              <Link to="/hospital/data" className="flex items-center gap-1.5 bg-chart-2 text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium hover:shadow-[0_0_20px_oklch(0.70_0.12_160/30%)] transition-all">
                <Database className="h-3.5 w-3.5" /> Open Data Center
              </Link>
            </GlassCard>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BedDouble, label: "Total Beds", value: bedCount.toString(), sub: `${occupied} occupied · ${hd.liveOps.beds.vacant} vacant` },
              { icon: Activity, label: "Occupancy", value: `${Math.round((occupied / bedCount) * 100)}%`, sub: "Target: < 85%" },
              { icon: Users, label: "Staff On Duty", value: `${hd.liveOps.staff.onDutyDoctors} doctors`, sub: `${hd.liveOps.staff.onDutyNurses} nurses on duty` },
              { icon: Wrench, label: "Equipment Ready", value: `${Math.round(((hd.equipment.ventilators - hd.liveOps.equipment.maintenancePending) / Math.max(1, hd.equipment.ventilators)) * 100)}%`, sub: `${hd.equipment.ventilators} ventilators` },
            ].map(k => (
              <GlassCard key={k.label} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className="h-4 w-4 text-chart-2" />
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
              </GlassCard>
            ))}
          </div>

          {/* Wards + Staff + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-chart-2" /> Ward Overview
              </h3>
              <div className="space-y-2">
                {["General Ward", "ICU", "Emergency", "Pediatrics", "Maternity", "Surgery"].map((ward, i) => {
                  const wardBeds = Math.round(bedCount / 6);
                  const pct = Math.min(98, Math.round(60 + i * 6));
                  return (
                    <div key={ward} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{ward}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : pct > 70 ? "bg-chart-4" : "bg-chart-2"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-chart-2" /> Staff Summary
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { role: "Doctors", count: hd.staff.doctors, status: `${hd.liveOps.staff.onDutyDoctors} on duty` },
                  { role: "Nurses", count: hd.staff.nurses, status: `${hd.liveOps.staff.onDutyNurses} on duty` },
                  { role: "Specialists", count: hd.staff.specialists, status: "Available" },
                  { role: "Support", count: hd.staff.supportStaff, status: "Active" },
                ].map(s => (
                  <div key={s.role} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{s.role}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{s.count}</span>
                      <span className="text-chart-2 text-[10px]">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-2" /> Recent Activity
              </h3>
              <div className="space-y-2 text-xs">
                {auditLog.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground/50 w-16 shrink-0">{a.time}</span>
                    <span className="text-muted-foreground">{a.action}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Hospital info bar */}
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-chart-2" /> {tenant.city || "Chennai"}, {tenant.state}</span>
              <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-chart-2" /> {bedCount} beds</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-chart-2" /> {tenant.phone || "044-XXXX-XXXX"}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-chart-2" /> {tenant.email}</span>
              <span className="ml-auto text-[10px] text-muted-foreground/50 flex items-center gap-1"><Shield className="h-3 w-3" /> Isolated tenant workspace</span>
            </div>
          </GlassCard>
        </>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Staff Users</h2>
            <button className="inline-flex items-center gap-1.5 bg-chart-2 text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium hover:shadow-[0_0_20px_oklch(0.70_0.12_160/30%)] transition-all">
              <UserPlus className="h-3.5 w-3.5" /> Invite Staff
            </button>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-foreground font-medium">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 text-[10px] font-medium">{ROLE_LABELS[u.role]}</span></td>
                    <td className="p-3"><span className={`text-[10px] font-medium ${u.active ? "text-chart-2" : "text-muted-foreground"}`}>{u.active ? "Active" : "Disabled"}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-3 w-3" /></button>
                        <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          {/* Role permissions grid */}
          <h3 className="text-sm font-semibold text-foreground mt-6">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.entries(ROLE_LABELS) as [HospitalRole, string][]).map(([role, label]) => (
              <GlassCard key={role} className="p-3">
                <h4 className="text-xs font-semibold text-chart-2 mb-1.5">{label}</h4>
                <div className="flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[role].map(p => (
                    <span key={p} className="px-2 py-0.5 rounded bg-muted/50 text-[10px] text-muted-foreground">{p === "*" ? "Full Access" : p}</span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-chart-2" /> Audit Log</h2>
          <GlassCard className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((a, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground/60 text-xs">{a.time}</td>
                    <td className="p-3 text-foreground">{a.user}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-chart-2/10 text-chart-2 text-[10px]">{a.action}</span></td>
                    <td className="p-3 text-muted-foreground">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
