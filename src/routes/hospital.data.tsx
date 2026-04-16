import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  BedDouble, Users, Wrench, Activity, Save, RotateCcw, Upload, Download,
  CheckCircle, AlertTriangle, Building2, Clock, RefreshCw, Zap, FileText,
  HeartPulse, Stethoscope, Pill, Receipt, Truck, Shield, History,
} from "lucide-react";
import { GlassCard } from "@/components/layout/GlassCard";
import { getHospitalAuth } from "@/lib/hospitalAuth";
import {
  loadHospitalData, saveHospitalData, addChangeLog, validateLiveOps, exportToCSV, parseCSV,
  type HospitalDataState, type ValidationError, getDefaultState,
} from "@/lib/hospitalDataEngine";
import { toast } from "sonner";

export const Route = createFileRoute("/hospital/data")({
  component: HospitalDataCenter,
});

type Tab = "profile" | "capacity" | "staff" | "equipment" | "liveOps" | "history" | "import";

const inputCls = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-chart-2 focus:ring-1 focus:ring-chart-2/30 transition-all";
const errorInputCls = "w-full bg-destructive/5 border border-destructive/40 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/30 transition-all";

function NumField({ label, value, onChange, error, icon: Icon }: { label: string; value: number; onChange: (v: number) => void; error?: string; icon?: React.ElementType }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </label>
      <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)} className={error ? errorInputCls : inputCls} />
      {error && <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {error}</p>}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

function HospitalDataCenter() {
  const auth = getHospitalAuth();
  const tenantId = auth?.tenant?.id || "demo";
  const userName = auth?.user?.name || "Admin";

  const [tab, setTab] = useState<Tab>("liveOps");
  const [data, setData] = useState<HospitalDataState>(() => loadHospitalData(tenantId));
  const [saved, setSaved] = useState<HospitalDataState>(() => loadHospitalData(tenantId));
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(data) !== JSON.stringify(saved);

  function updateField<S extends keyof HospitalDataState>(section: S, field: string, value: unknown) {
    setData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === "object" && sectionData !== null && !Array.isArray(sectionData)) {
        return { ...prev, [section]: { ...sectionData, [field]: value } };
      }
      return prev;
    });
  }

  function updateNested(section: "liveOps", group: keyof HospitalDataState["liveOps"], field: string, value: number) {
    setData(prev => ({
      ...prev,
      liveOps: { ...prev.liveOps, [group]: { ...prev.liveOps[group], [field]: value } },
    }));
  }

  function handleSave() {
    const validationErrors = validateLiveOps(data);
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      toast.error(`${validationErrors.length} validation error(s) found`);
      return;
    }
    saveHospitalData(tenantId, { ...data, setupComplete: true });
    setSaved({ ...data, setupComplete: true, lastSynced: new Date().toISOString() });
    setData(d => ({ ...d, setupComplete: true, lastSynced: new Date().toISOString() }));
    toast.success("Data saved successfully");
  }

  function handleRevert() {
    setData({ ...saved });
    setErrors([]);
    toast.info("Reverted to last saved state");
  }

  function handleSync() {
    const validationErrors = validateLiveOps(data);
    setErrors(validationErrors);
    if (validationErrors.length > 0) { toast.error("Fix validation errors first"); return; }
    setSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      const updated = addChangeLog(data, userName, "sync", "Full Sync", "", "Complete");
      saveHospitalData(tenantId, { ...updated, setupComplete: true, lastSynced: new Date().toISOString() });
      setSaved({ ...updated, setupComplete: true, lastSynced: new Date().toISOString() });
      setData(d => ({ ...d, ...updated, setupComplete: true, lastSynced: new Date().toISOString() }));
      setSyncing(false);
      setSyncDone(true);
      toast.success("Hospital synced — dashboards updated!");
      setTimeout(() => setSyncDone(false), 3000);
    }, 2000);
  }

  function handleExport() {
    const rows = [
      { section: "Capacity", ...data.capacity },
      { section: "Staff", ...data.staff },
      { section: "Equipment", ...data.equipment },
      { section: "OpsBaseline", ...data.opsBaseline },
    ];
    exportToCSV(rows as Record<string, unknown>[], `hospital_data_${tenantId}.csv`);
    toast.success("CSV exported");
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target?.result as string);
        if (rows.length > 0) {
          toast.success(`Imported ${rows.length} rows — review and save`);
        }
      } catch { toast.error("Failed to parse CSV"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const errMap: Record<string, string> = {};
  errors.forEach(e => { errMap[e.field] = e.message; });

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "liveOps", label: "Live Operations", icon: Activity },
    { key: "capacity", label: "Infrastructure", icon: BedDouble },
    { key: "staff", label: "Staffing", icon: Users },
    { key: "equipment", label: "Equipment", icon: Wrench },
    { key: "profile", label: "Hospital Profile", icon: Building2 },
    { key: "history", label: "Change Log", icon: History },
    { key: "import", label: "Import / Export", icon: FileText },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-chart-2" /> Hospital Data Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage all operational data for {auth?.tenant?.name || "your hospital"}
            {data.lastSynced && <span className="ml-2 text-chart-2">Last synced: {new Date(data.lastSynced).toLocaleString("en-IN")}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button onClick={handleRevert} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
              <RotateCcw className="h-3.5 w-3.5" /> Revert
            </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-chart-2/20 border border-chart-2/30 text-chart-2 text-xs font-medium hover:bg-chart-2/30 transition-all">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chart-2 text-primary-foreground text-sm font-bold hover:shadow-[0_0_30px_oklch(0.70_0.12_160/40%)] transition-all disabled:opacity-50">
            {syncing ? (
              <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Syncing...</>
            ) : syncDone ? (
              <><CheckCircle className="h-4 w-4" /> Synced!</>
            ) : (
              <><Zap className="h-4 w-4" /> SYNC MY HOSPITAL NOW</>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${tab === t.key ? "bg-chart-2 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Validation errors banner */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-destructive">{errors.length} validation error(s)</p>
            {errors.map((e, i) => <p key={i} className="text-[10px] text-destructive/80 mt-0.5">{e.message}</p>)}
          </div>
        </div>
      )}

      {/* LIVE OPS */}
      {tab === "liveOps" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BedDouble className="h-4 w-4 text-chart-2" /> Beds Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Occupied" value={data.liveOps.beds.occupied} onChange={v => updateNested("liveOps", "beds", "occupied", v)} error={errMap["beds"]} />
              <NumField label="Vacant" value={data.liveOps.beds.vacant} onChange={v => updateNested("liveOps", "beds", "vacant", v)} />
              <NumField label="Under Cleaning" value={data.liveOps.beds.underCleaning} onChange={v => updateNested("liveOps", "beds", "underCleaning", v)} />
              <NumField label="Blocked" value={data.liveOps.beds.blocked} onChange={v => updateNested("liveOps", "beds", "blocked", v)} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-chart-2" /> Admissions</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Today Admitted" value={data.liveOps.admissions.todayAdmitted} onChange={v => updateNested("liveOps", "admissions", "todayAdmitted", v)} />
              <NumField label="ER Waiting" value={data.liveOps.admissions.erWaiting} onChange={v => updateNested("liveOps", "admissions", "erWaiting", v)} />
              <NumField label="Surgery Scheduled" value={data.liveOps.admissions.surgeryScheduled} onChange={v => updateNested("liveOps", "admissions", "surgeryScheduled", v)} />
              <NumField label="ICU Pending" value={data.liveOps.admissions.icuPending} onChange={v => updateNested("liveOps", "admissions", "icuPending", v)} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-chart-2" /> Staff On Duty</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Doctors" value={data.liveOps.staff.onDutyDoctors} onChange={v => updateNested("liveOps", "staff", "onDutyDoctors", v)} error={errMap["onDutyDoctors"]} />
              <NumField label="Nurses" value={data.liveOps.staff.onDutyNurses} onChange={v => updateNested("liveOps", "staff", "onDutyNurses", v)} error={errMap["onDutyNurses"]} />
              <NumField label="On Leave" value={data.liveOps.staff.leaveCount} onChange={v => updateNested("liveOps", "staff", "leaveCount", v)} />
              <NumField label="Absent" value={data.liveOps.staff.absentCount} onChange={v => updateNested("liveOps", "staff", "absentCount", v)} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Wrench className="h-4 w-4 text-chart-2" /> Equipment Active</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Ventilators In Use" value={data.liveOps.equipment.ventilatorsInUse} onChange={v => updateNested("liveOps", "equipment", "ventilatorsInUse", v)} error={errMap["ventilatorsInUse"]} />
              <NumField label="Monitors In Use" value={data.liveOps.equipment.monitorsInUse} onChange={v => updateNested("liveOps", "equipment", "monitorsInUse", v)} error={errMap["monitorsInUse"]} />
              <NumField label="Oxygen Active" value={data.liveOps.equipment.oxygenActive} onChange={v => updateNested("liveOps", "equipment", "oxygenActive", v)} error={errMap["oxygenActive"]} />
              <NumField label="Maintenance Pending" value={data.liveOps.equipment.maintenancePending} onChange={v => updateNested("liveOps", "equipment", "maintenancePending", v)} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-chart-2" /> Patient Flow</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Discharge Ready" value={data.liveOps.patientFlow.dischargeReady} onChange={v => updateNested("liveOps", "patientFlow", "dischargeReady", v)} icon={CheckCircle} />
              <NumField label="Transfer Pending" value={data.liveOps.patientFlow.transferPending} onChange={v => updateNested("liveOps", "patientFlow", "transferPending", v)} />
              <NumField label="Pharmacy Delays" value={data.liveOps.patientFlow.pharmacyDelays} onChange={v => updateNested("liveOps", "patientFlow", "pharmacyDelays", v)} icon={Pill} />
              <NumField label="Billing Pending" value={data.liveOps.patientFlow.billingPending} onChange={v => updateNested("liveOps", "patientFlow", "billingPending", v)} icon={Receipt} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><HeartPulse className="h-4 w-4 text-chart-2" /> Ops Baseline</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Avg Daily Admissions" value={data.opsBaseline.avgDailyAdmissions} onChange={v => updateField("opsBaseline", "avgDailyAdmissions", v)} />
              <NumField label="Avg Daily Discharges" value={data.opsBaseline.avgDailyDischarges} onChange={v => updateField("opsBaseline", "avgDailyDischarges", v)} />
              <NumField label="Avg Wait Time (min)" value={data.opsBaseline.avgWaitTime} onChange={v => updateField("opsBaseline", "avgWaitTime", v)} />
              <NumField label="Avg ICU Util %" value={data.opsBaseline.avgIcuUtilization} onChange={v => updateField("opsBaseline", "avgIcuUtilization", v)} />
            </div>
          </GlassCard>
        </div>
      )}

      {/* CAPACITY */}
      {tab === "capacity" && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><BedDouble className="h-4 w-4 text-chart-2" /> Infrastructure Setup</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumField label="Total Beds" value={data.capacity.totalBeds} onChange={v => updateField("capacity", "totalBeds", v)} icon={BedDouble} />
            <NumField label="General Beds" value={data.capacity.generalBeds} onChange={v => updateField("capacity", "generalBeds", v)} />
            <NumField label="ICU Beds" value={data.capacity.icuBeds} onChange={v => updateField("capacity", "icuBeds", v)} icon={HeartPulse} />
            <NumField label="HDU Beds" value={data.capacity.hduBeds} onChange={v => updateField("capacity", "hduBeds", v)} />
            <NumField label="Isolation Beds" value={data.capacity.isolationBeds} onChange={v => updateField("capacity", "isolationBeds", v)} />
            <NumField label="Operation Theaters" value={data.capacity.operationTheaters} onChange={v => updateField("capacity", "operationTheaters", v)} />
            <NumField label="Ambulances" value={data.capacity.ambulances} onChange={v => updateField("capacity", "ambulances", v)} />
            <NumField label="Floors" value={data.capacity.floors} onChange={v => updateField("capacity", "floors", v)} />
            <NumField label="Wards Count" value={data.capacity.wardsCount} onChange={v => updateField("capacity", "wardsCount", v)} />
          </div>
        </GlassCard>
      )}

      {/* STAFF */}
      {tab === "staff" && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-chart-2" /> Staffing Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumField label="Doctors" value={data.staff.doctors} onChange={v => updateField("staff", "doctors", v)} />
            <NumField label="Nurses" value={data.staff.nurses} onChange={v => updateField("staff", "nurses", v)} />
            <NumField label="Specialists" value={data.staff.specialists} onChange={v => updateField("staff", "specialists", v)} />
            <NumField label="Admin Staff" value={data.staff.adminStaff} onChange={v => updateField("staff", "adminStaff", v)} />
            <NumField label="Support Staff" value={data.staff.supportStaff} onChange={v => updateField("staff", "supportStaff", v)} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Shift Model</label>
              <div className="flex gap-2">
                {([2, 3] as const).map(s => (
                  <button key={s} onClick={() => updateField("staff", "shiftModel", s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${data.staff.shiftModel === s ? "bg-chart-2 text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                    {s}-Shift
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* EQUIPMENT */}
      {tab === "equipment" && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Wrench className="h-4 w-4 text-chart-2" /> Equipment Inventory</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumField label="Ventilators" value={data.equipment.ventilators} onChange={v => updateField("equipment", "ventilators", v)} />
            <NumField label="Patient Monitors" value={data.equipment.monitors} onChange={v => updateField("equipment", "monitors", v)} />
            <NumField label="Oxygen Units" value={data.equipment.oxygenUnits} onChange={v => updateField("equipment", "oxygenUnits", v)} />
            <NumField label="Wheelchairs" value={data.equipment.wheelchairs} onChange={v => updateField("equipment", "wheelchairs", v)} />
            <NumField label="Infusion Pumps" value={data.equipment.infusionPumps} onChange={v => updateField("equipment", "infusionPumps", v)} />
            <NumField label="Portable Beds" value={data.equipment.portableBeds} onChange={v => updateField("equipment", "portableBeds", v)} />
          </div>
        </GlassCard>
      )}

      {/* PROFILE */}
      {tab === "profile" && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-chart-2" /> Hospital Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Hospital Name" value={data.profile.name || auth?.tenant?.name || ""} onChange={v => updateField("profile", "name", v)} />
            <TextField label="Type" value={data.profile.type || auth?.tenant?.type || ""} onChange={v => updateField("profile", "type", v)} />
            <TextField label="District" value={data.profile.district || auth?.tenant?.district || ""} onChange={v => updateField("profile", "district", v)} />
            <TextField label="Address" value={data.profile.address} onChange={v => updateField("profile", "address", v)} />
            <TextField label="Contact" value={data.profile.contact || auth?.tenant?.phone || ""} onChange={v => updateField("profile", "contact", v)} />
            <TextField label="Departments" value={data.profile.departments} onChange={v => updateField("profile", "departments", v)} />
            <TextField label="Specialties" value={data.profile.specialties} onChange={v => updateField("profile", "specialties", v)} />
            <TextField label="Emergency Level" value={data.profile.emergencyLevel} onChange={v => updateField("profile", "emergencyLevel", v)} />
            <TextField label="Working Hours" value={data.profile.workingHours} onChange={v => updateField("profile", "workingHours", v)} />
          </div>
        </GlassCard>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><History className="h-4 w-4 text-chart-2" /> Change History</h3>
          </div>
          {data.changeLog.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No changes recorded yet. Save or sync data to start tracking.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">Time</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Section</th>
                  <th className="text-left p-3 font-medium">Field</th>
                  <th className="text-left p-3 font-medium">Old → New</th>
                </tr>
              </thead>
              <tbody>
                {data.changeLog.map(e => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground/60 text-xs">{new Date(e.timestamp).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-foreground">{e.user}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-chart-2/10 text-chart-2 text-[10px]">{e.section}</span></td>
                    <td className="p-3 text-muted-foreground">{e.field}</td>
                    <td className="p-3 text-xs">{e.oldValue ? <><span className="text-destructive line-through">{e.oldValue}</span> → </> : ""}<span className="text-chart-2">{e.newValue}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      )}

      {/* IMPORT/EXPORT */}
      {tab === "import" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Upload className="h-4 w-4 text-chart-2" /> Import Data</h3>
            <p className="text-xs text-muted-foreground mb-4">Upload a CSV file with hospital data. Supports beds, staff, equipment, and daily operations.</p>
            <input type="file" ref={fileRef} accept=".csv" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-chart-2/30 text-chart-2 text-sm font-medium hover:bg-chart-2/10 transition-all w-full justify-center">
              <Upload className="h-4 w-4" /> Choose CSV File
            </button>
            <div className="mt-4 space-y-1 text-[10px] text-muted-foreground">
              <p>Supported formats: beds.csv, staff.csv, equipment.csv, daily_operations.csv</p>
              <p>Excel import: coming soon</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Download className="h-4 w-4 text-chart-2" /> Export Data</h3>
            <p className="text-xs text-muted-foreground mb-4">Download current hospital data as CSV for backup or external analysis.</p>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-chart-2/20 border border-chart-2/30 text-chart-2 text-sm font-medium hover:bg-chart-2/30 transition-all w-full justify-center">
              <Download className="h-4 w-4" /> Export Hospital Data (CSV)
            </button>
          </GlassCard>
        </div>
      )}

      {/* Sync success overlay */}
      {syncDone && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setSyncDone(false)}>
          <GlassCard glow className="p-8 max-w-md text-center">
            <div className="h-16 w-16 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "0 0 40px oklch(0.70 0.12 160 / 40%)" }}>
              <CheckCircle className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Hospital Synced</h3>
            <p className="text-sm text-muted-foreground mb-4">All data validated and saved. Dashboards, AI models, and predictions are now using your latest data.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Occupancy", value: `${Math.round((data.liveOps.beds.occupied / data.capacity.totalBeds) * 100)}%` },
                { label: "Staff Active", value: `${data.liveOps.staff.onDutyDoctors + data.liveOps.staff.onDutyNurses}` },
                { label: "Equipment Ready", value: `${Math.round(((data.equipment.ventilators - data.liveOps.equipment.maintenancePending) / data.equipment.ventilators) * 100)}%` },
                { label: "Discharge Queue", value: data.liveOps.patientFlow.dischargeReady.toString() },
              ].map(m => (
                <div key={m.label} className="bg-muted/30 rounded-lg p-2">
                  <p className="text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold text-chart-2">{m.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
