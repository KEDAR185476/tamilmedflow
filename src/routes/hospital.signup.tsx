import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Hospital, Shield, Lock, Eye, EyeOff, Building2, Mail, Phone, MapPin,
  FileText, Globe, BedDouble, ArrowRight, CheckCircle, Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { HOSPITAL_TYPES, createTenantId, setHospitalAuth } from "@/lib/hospitalAuth";

export const Route = createFileRoute("/hospital/signup")({
  component: HospitalSignup,
});

function HospitalSignup() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", type: HOSPITAL_TYPES[0], registrationId: "", email: "", phone: "",
    city: "", district: "", state: "Tamil Nadu", password: "", confirm: "",
    beds: "", website: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.email && form.password && form.password === form.confirm && form.password.length >= 8;

  const handleSignup = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      const tenantId = createTenantId(form.name, form.city || "city");
      setHospitalAuth({
        tenant: {
          id: tenantId, name: form.name, type: form.type, registrationId: form.registrationId,
          email: form.email, phone: form.phone, city: form.city, district: form.district,
          state: form.state, beds: parseInt(form.beds) || undefined, website: form.website,
          createdAt: new Date().toISOString(),
        },
        user: {
          id: crypto.randomUUID(), tenantId, email: form.email, name: "Admin",
          role: "super_admin", isActive: true, lastLogin: new Date().toISOString(),
        },
      });
      navigate({ to: "/hospital/onboarding" });
    }, 1200);
  };

  const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 30% 20%, oklch(0.20 0.04 190 / 60%) 0%, oklch(0.13 0.02 260) 70%)" }}>
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chart-2/10 border border-chart-2/20 text-chart-2 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" /> Secure Healthcare Platform
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-chart-2/15 flex items-center justify-center" style={{ boxShadow: "0 0 25px oklch(0.70 0.12 160 / 30%)" }}>
              <Hospital className="h-6 w-6 text-chart-2" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Create Hospital Workspace</h1>
          </div>
          <p className="text-sm text-muted-foreground">Set up your private, secure hospital intelligence platform</p>
        </div>

        <GlassCard className="p-6">
          <div className="space-y-5">
            {/* Hospital Identity */}
            <div>
              <h3 className="text-xs font-semibold text-chart-2 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Hospital Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hospital Name *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g., Apollo Hospital" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hospital Type</label>
                  <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                    {HOSPITAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Registration / License ID</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input value={form.registrationId} onChange={e => set("registrationId", e.target.value)} placeholder="TN-HOSP-XXXX" className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Number of Beds</label>
                  <div className="relative">
                    <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="number" value={form.beds} onChange={e => set("beds", e.target.value)} placeholder="e.g., 250" className={`${inputCls} pl-9`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-chart-2 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@hospital.org" className={`${inputCls} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="044-XXXX-XXXX" className={`${inputCls} pl-9`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xs font-semibold text-chart-2 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">City</label>
                  <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Chennai" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">District</label>
                  <input value={form.district} onChange={e => set("district", e.target.value)} placeholder="Chennai" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">State</label>
                  <input value={form.state} onChange={e => set("state", e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Optional */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Website (optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://www.hospital.org" className={`${inputCls} pl-9`} />
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-xs font-semibold text-chart-2 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 8 characters" className={`${inputCls} pl-9 pr-9`} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password" className={`${inputCls} pl-9`} />
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-destructive text-[10px] mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-chart-2" /> AES-256 Encrypted</span>
              <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-chart-2" /> HIPAA Architecture</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-chart-2" /> Multi-Tenant Isolated</span>
            </div>

            <button onClick={handleSignup} disabled={!valid || loading}
              className="w-full bg-chart-2 text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Creating Workspace...</>
              ) : (
                <><ArrowRight className="h-4 w-4" /> Create Hospital Workspace</>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/hospital/login" className="text-chart-2 hover:underline font-medium">Sign In</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
