import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hospital, Mail, ArrowLeft, Shield, CheckCircle, Send } from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";

export const Route = createFileRoute("/hospital/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 1200);
  };

  const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at 30% 20%, oklch(0.20 0.04 190 / 60%) 0%, oklch(0.13 0.02 260) 70%)" }}>
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-chart-2/15 flex items-center justify-center" style={{ boxShadow: "0 0 25px oklch(0.70 0.12 160 / 30%)" }}>
              <Hospital className="h-6 w-6 text-chart-2" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Reset Password</h1>
          </div>
          <p className="text-sm text-muted-foreground">We'll send a secure reset link to your email</p>
        </div>

        <GlassCard className="p-6">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-chart-2/15 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Reset Link Sent</h3>
              <p className="text-sm text-muted-foreground">Check <span className="text-chart-2">{email}</span> for the password reset link.</p>
              <Link to="/hospital/login" className="inline-flex items-center gap-1 text-sm text-chart-2 hover:underline font-medium">
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email / Hospital ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@hospital.org" className={`${inputCls} pl-9`} />
                </div>
              </div>
              <button onClick={handleSend} disabled={!email || loading}
                className="w-full bg-chart-2 text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? (
                  <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Reset Link</>
                )}
              </button>
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Reset</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/hospital/login" className="text-chart-2 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
