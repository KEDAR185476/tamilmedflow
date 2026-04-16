import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Hospital, Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth, setHospitalAuth } from "@/lib/hospitalAuth";

export const Route = createFileRoute("/hospital/login")({
  component: HospitalLogin,
});

function HospitalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      const existing = getHospitalAuth();
      if (existing && existing.tenant.email === email) {
        existing.user.lastLogin = new Date().toISOString();
        setHospitalAuth(existing);
        navigate({ to: "/hospital" });
      } else {
        // Demo: create a quick session
        setHospitalAuth({
          tenant: {
            id: "tenant_demo", name: "Demo Hospital", type: "Private Hospital",
            registrationId: "TN-DEMO-001", email, phone: "", city: "Chennai",
            district: "Chennai", state: "Tamil Nadu", createdAt: new Date().toISOString(),
          },
          user: {
            id: crypto.randomUUID(), tenantId: "tenant_demo", email, name: "Admin",
            role: "super_admin", isActive: true, lastLogin: new Date().toISOString(),
          },
        });
        navigate({ to: "/hospital" });
      }
      setLoading(false);
    }, 1000);
  };

  const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 30% 20%, oklch(0.20 0.04 190 / 60%) 0%, oklch(0.13 0.02 260) 70%)" }}>
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chart-2/10 border border-chart-2/20 text-chart-2 text-xs font-medium mb-4">
            <Shield className="h-3 w-3" /> Secure Access
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-chart-2/15 flex items-center justify-center" style={{ boxShadow: "0 0 25px oklch(0.70 0.12 160 / 30%)" }}>
              <Hospital className="h-6 w-6 text-chart-2" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Hospital Sign In</h1>
          </div>
          <p className="text-sm text-muted-foreground">Access your private hospital workspace</p>
        </div>

        <GlassCard className="p-6">
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive">{error}</div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email / Hospital ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hospital.org" className={`${inputCls} pl-9`} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className={`${inputCls} pl-9 pr-9`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-chart-2 rounded" /> Remember me
              </label>
              <Link to="/hospital/forgot-password" className="text-xs text-chart-2 hover:underline">Forgot Password?</Link>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-chart-2 text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Signing In...</>
              ) : "Sign In"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] text-muted-foreground">or</span></div>
            </div>

            <button disabled className="w-full border border-border bg-muted/30 text-muted-foreground py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
              <Sparkles className="h-3.5 w-3.5" /> Login with OTP (Coming Soon)
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/hospital/signup" className="text-chart-2 hover:underline font-medium">Create Workspace</Link>
            </p>
          </div>
        </GlassCard>

        <div className="mt-6 flex justify-center gap-4 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> JWT Auth</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> End-to-End Encrypted</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Session Timeout</span>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-chart-2 flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
