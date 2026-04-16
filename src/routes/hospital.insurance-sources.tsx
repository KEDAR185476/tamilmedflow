import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ExternalLink, Info, ShieldAlert, FileText } from "lucide-react";
import { SCHEME_REGISTRY } from "@/lib/insuranceEngine";

export const Route = createFileRoute("/hospital/insurance-sources")({
  head: () => ({
    meta: [
      { title: "Insurance Data Sources — MedFlow Nexus" },
      { name: "description", content: "Public sources backing the Insurance Intelligence engine: PM-JAY, CMCHIS, ESI, CGHS and more." },
    ],
  }),
  component: SourcesPage,
});

const lastReviewed = "2025-01-15";

function SourcesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link to="/hospital/insurance" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Insurance Intelligence
        </Link>
        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-primary mb-2">
          <FileText className="h-3 w-3" /> DATA TRANSPARENCY
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Insurance Data Sources</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          The Insurance Intelligence engine references the following publicly available Indian and Tamil Nadu health schemes. All eligibility decisions remain heuristic and require manual verification with the issuing authority.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Manual verification required.</strong> Scheme rules, eligibility ceilings, document lists, and benefit ranges change periodically.
          Always confirm current criteria on the official portal linked below before relying on the engine's output for any clinical or financial decision.
          Last reviewed: <span className="text-foreground">{lastReviewed}</span>.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SCHEME_REGISTRY.map(s => (
          <div key={s.id} className="glass rounded-xl border border-border/30 p-4 hover:border-primary/40 transition-colors">
            <h3 className="text-sm font-bold text-foreground mb-1">{s.name}</h3>
            <div className="text-[11px] text-muted-foreground mb-3">{s.authority}</div>
            <div className="space-y-1.5 text-[11px]">
              <Row label="Coverage" value={s.coverageType} />
              <Row label="Benefit" value={s.benefitRange} />
              <Row label="Apply at" value={s.applyAt} />
              <Row label="Documents" value={s.documentsRequired.join(", ")} />
            </div>
            <a href={s.source} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              {s.source} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-border/30 p-5">
        <h3 className="text-sm font-bold inline-flex items-center gap-2 mb-2"><Info className="h-3.5 w-3.5 text-primary" /> Methodology</h3>
        <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
          <li>• Eligibility is computed as a weighted heuristic across patient state, income, BPL status, occupation, age, gender and treatment type.</li>
          <li>• Confidence is bucketed into five honesty labels (Likely Eligible → No Current Match Found) — the engine never declares a guaranteed match.</li>
          <li>• Document checklists are derived from each scheme's stated requirements and are flagged as Available, Need Verification, or Missing based on patient inputs.</li>
          <li>• Benefit ranges are taken directly from the scheme's published portal at the time of last review and may not reflect localised top-ups.</li>
          <li>• Private insurance flows are advisory only — pre-authorisation and network checks must be confirmed with the patient's insurer.</li>
        </ul>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground/70 mr-1.5">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
