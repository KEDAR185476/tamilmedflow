import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/layout/GlassCard";
import { useState } from "react";
import {
  Hospital, BedDouble, Users, Wrench, Activity, ArrowRight, CheckCircle,
  Building2, MapPin, Phone, Mail, Globe, Plus,
} from "lucide-react";

export const Route = createFileRoute("/hospital/")({
  component: HospitalHome,
});

function HospitalHome() {
  const [step, setStep] = useState<"welcome" | "setup" | "dashboard">("welcome");
  const [hospitalName, setHospitalName] = useState("");
  const [beds, setBeds] = useState("200");
  const [city, setCity] = useState("Chennai");
  const [setupDone, setSetupDone] = useState(false);

  if (step === "welcome" && !setupDone) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-slide-up">
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-chart-2/15 flex items-center justify-center mx-auto mb-5">
            <Hospital className="h-8 w-8 text-chart-2" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">Welcome to My Hospital</h1>
          <p className="text-muted-foreground">Set up your personalized hospital intelligence platform in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Building2, title: "Configure Hospital", desc: "Enter your hospital details, bed capacity, and departments" },
            { icon: Users, title: "Connect Staff Data", desc: "Import or configure your workforce roster and schedules" },
            { icon: Activity, title: "Go Live", desc: "Start tracking operations with AI-powered intelligence" },
          ].map((s, i) => (
            <GlassCard key={s.title} className="p-5 text-center">
              <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="h-5 w-5 text-chart-2" />
              </div>
              <div className="text-xs text-chart-2 font-medium mb-2">Step {i + 1}</div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </GlassCard>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => setStep("setup")}
            className="inline-flex items-center gap-2 bg-chart-2 text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all">
            <Plus className="h-4 w-4" /> Set Up My Hospital
          </button>
        </div>
      </div>
    );
  }

  if (step === "setup" && !setupDone) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-slide-up">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-chart-2" /> Hospital Setup
        </h2>
        <GlassCard className="p-6 space-y-5">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hospital Name</label>
            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)}
              placeholder="e.g., Apollo Hospital Chennai" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-chart-2 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">City / District</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-chart-2 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Total Beds</label>
              <input type="number" value={beds} onChange={e => setBeds(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-chart-2 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["General Ward", "ICU", "Emergency", "Pediatrics", "Maternity", "Surgery"].map(dept => (
              <label key={dept} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-chart-2" /> {dept}
              </label>
            ))}
          </div>
          <button onClick={() => { setSetupDone(true); setStep("dashboard"); }}
            className="w-full bg-chart-2 text-primary-foreground py-2.5 rounded-lg font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" /> Complete Setup &amp; Launch
          </button>
        </GlassCard>
      </div>
    );
  }

  // Dashboard view after setup
  const name = hospitalName || "My Hospital";
  const bedCount = parseInt(beds) || 200;
  const occupied = Math.round(bedCount * 0.76);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Hospital className="h-6 w-6 text-chart-2" />
          {name}
        </h1>
        <p className="text-sm text-muted-foreground">{city} — Personalized Hospital Intelligence</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BedDouble, label: "Total Beds", value: bedCount.toString(), sub: `${occupied} occupied` },
          { icon: Activity, label: "Occupancy", value: `${Math.round((occupied / bedCount) * 100)}%`, sub: "Target: < 85%" },
          { icon: Users, label: "Staff On Duty", value: Math.round(bedCount * 0.4).toString(), sub: "All shifts" },
          { icon: Wrench, label: "Equipment Ready", value: "94%", sub: "2 maintenance pending" },
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

      {/* Quick modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-chart-2" /> Ward Overview
          </h3>
          <div className="space-y-2">
            {["General Ward", "ICU", "Emergency", "Pediatrics", "Maternity", "Surgery"].map((ward, i) => {
              const wardBeds = Math.round(bedCount / 6);
              const wardOcc = Math.round(wardBeds * (0.6 + i * 0.06));
              const pct = Math.round((wardOcc / wardBeds) * 100);
              return (
                <div key={ward} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{ward}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
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
              { role: "Doctors", count: Math.round(bedCount * 0.08), status: "Available" },
              { role: "Nurses", count: Math.round(bedCount * 0.25), status: "On Duty" },
              { role: "Specialists", count: Math.round(bedCount * 0.03), status: "Available" },
              { role: "Technicians", count: Math.round(bedCount * 0.04), status: "On Call" },
            ].map(s => (
              <div key={s.role} className="flex items-center justify-between">
                <span className="text-muted-foreground">{s.role}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">{s.count}</span>
                  <span className="text-success text-[10px]">{s.status}</span>
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
            {[
              { time: "2 min ago", event: "Patient admitted to ICU" },
              { time: "15 min ago", event: "Discharge completed (Ward B)" },
              { time: "32 min ago", event: "Equipment maintenance alert" },
              { time: "1 hr ago", event: "Staff shift handover" },
              { time: "2 hr ago", event: "Bed reassignment completed" },
            ].map((a, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground/50 w-16 shrink-0">{a.time}</span>
                <span className="text-muted-foreground">{a.event}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Hospital info */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-chart-2" /> {city}, Tamil Nadu</span>
          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-chart-2" /> {bedCount} beds</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-chart-2" /> 044-XXXX-XXXX</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-chart-2" /> admin@{name.toLowerCase().replace(/\s+/g, "")}.org</span>
          <span className="ml-auto text-[10px] text-muted-foreground/50">Data: Local hospital configuration • Not connected to external feeds</span>
        </div>
      </GlassCard>
    </div>
  );
}
