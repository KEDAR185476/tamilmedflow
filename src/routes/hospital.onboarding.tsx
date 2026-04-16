import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Hospital, BedDouble, Users, Wrench, Rocket, ArrowRight, ArrowLeft,
  CheckCircle, Palette, Building2, Stethoscope, HeartPulse,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth, setHospitalAuth, type OnboardingData } from "@/lib/hospitalAuth";

export const Route = createFileRoute("/hospital/onboarding")({
  component: HospitalOnboarding,
});

const STEPS = [
  { icon: Building2, label: "Identity", title: "Hospital Identity" },
  { icon: BedDouble, label: "Capacity", title: "Basic Capacity" },
  { icon: Users, label: "Staff", title: "Staff Setup" },
  { icon: Wrench, label: "Equipment", title: "Equipment Setup" },
  { icon: Rocket, label: "Launch", title: "Finish Setup" },
];

function HospitalOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    brandColor: "#10b981", hospitalSize: "medium", totalBeds: 200, icuBeds: 20,
    wardsCount: 6, operationTheaters: 4, ambulanceCount: 5, doctors: 30,
    nurses: 80, specialists: 12, shifts: 3, ventilators: 15, monitors: 40,
    oxygenUnits: 50, wheelchairs: 20,
  });

  const set = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => setData(d => ({ ...d, [k]: v }));
  const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => {
      const auth = getHospitalAuth();
      if (auth) { setHospitalAuth({ ...auth, onboarding: data }); }
      navigate({ to: "/hospital" });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 30% 20%, oklch(0.20 0.04 190 / 60%) 0%, oklch(0.13 0.02 260) 70%)" }}>
      <div className="w-full max-w-2xl animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-foreground mb-1">Hospital Onboarding</h1>
          <p className="text-sm text-muted-foreground">Configure your workspace in 5 easy steps</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? "bg-chart-2 text-primary-foreground shadow-[0_0_15px_oklch(0.70_0.12_160/40%)]" : "bg-muted/50 text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[10px] ${i <= step ? "text-chart-2 font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`absolute h-0.5 w-full ${i < step ? "bg-chart-2" : "bg-muted/30"}`} style={{ display: "none" }} />}
            </div>
          ))}
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-chart-2" />; })()}
            {STEPS[step].title}
          </h2>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={data.brandColor} onChange={e => set("brandColor", e.target.value)} className="h-10 w-14 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-muted-foreground">{data.brandColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hospital Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["small", "medium", "large", "enterprise"] as const).map(s => (
                    <button key={s} onClick={() => set("hospitalSize", s)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${data.hospitalSize === s ? "bg-chart-2 text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {([
                ["totalBeds", "Total Beds", BedDouble],
                ["icuBeds", "ICU Beds", HeartPulse],
                ["wardsCount", "Wards", Building2],
                ["operationTheaters", "OTs", Stethoscope],
                ["ambulanceCount", "Ambulances", Hospital],
              ] as const).map(([key, label, Icon]) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</label>
                  <input type="number" value={data[key]} onChange={e => set(key, parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {([
                ["doctors", "Doctors"],
                ["nurses", "Nurses"],
                ["specialists", "Specialists"],
                ["shifts", "Shift Rotations"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <input type="number" value={data[key]} onChange={e => set(key, parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              {([
                ["ventilators", "Ventilators"],
                ["monitors", "Patient Monitors"],
                ["oxygenUnits", "Oxygen Units"],
                ["wheelchairs", "Wheelchairs"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                  <input type="number" value={data[key]} onChange={e => set(key, parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="h-20 w-20 rounded-full bg-chart-2/15 flex items-center justify-center mx-auto" style={{ boxShadow: "0 0 40px oklch(0.70 0.12 160 / 30%)" }}>
                <Rocket className="h-10 w-10 text-chart-2" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Ready to Launch!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your hospital workspace is configured with {data.totalBeds} beds, {data.doctors} doctors, and {data.ventilators} ventilators.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Beds", "ICU", "Staff", "Equipment"].map(m => (
                  <span key={m} className="px-3 py-1 rounded-full bg-chart-2/10 border border-chart-2/20 text-chart-2 text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {m} Configured
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1 bg-chart-2 text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:shadow-[0_0_20px_oklch(0.70_0.12_160/30%)] transition-all">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleLaunch} disabled={launching}
                className="flex items-center gap-2 bg-chart-2 text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all disabled:opacity-50">
                {launching ? (
                  <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Launching...</>
                ) : (
                  <><Rocket className="h-4 w-4" /> Launch My Hospital Nexus</>
                )}
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
