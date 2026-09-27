import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck, LogOut, Plus, Calendar, Clock, CheckCircle2,
  AlertTriangle, XCircle, ChevronRight, User, Filter, Search,
  ArrowLeft, MapPin, BarChart3, Activity, ExternalLink, Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MOCK_QC_SCHEDULES,
  MOCK_CHECKSHEET_TEMPLATES,
  QCSchedule,
  QCScheduleStatus,
  QC_OFFICER_MAP,
  timeAgo,
} from "@/lib/mockData";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QCScheduleStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  scheduled:   { label: "กำหนดการ",      cls: "bg-blue-100 text-blue-700 border-blue-200",       icon: <Calendar className="h-3 w-3" /> },
  "in-progress": { label: "กำลังตรวจ",   cls: "bg-cyan-100 text-cyan-700 border-cyan-200",       icon: <Activity className="h-3 w-3" /> },
  done:        { label: "ตรวจแล้ว",      cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  missed:      { label: "ไม่ได้ตรวจ",   cls: "bg-red-100 text-red-700 border-red-200",           icon: <XCircle className="h-3 w-3" /> },
};

const FREQ_LABEL: Record<QCSchedule["frequency"], string> = {
  daily: "รายวัน",
  monthly: "รายเดือน",
};

// ─── New Schedule Modal ────────────────────────────────────────────────────────

function NewScheduleModal({ onClose, onSave }: { onClose: () => void; onSave: (s: QCSchedule) => void }) {
  const [form, setForm] = useState({
    title: "",
    machine_name: "",
    machine_id: "",
    zone: "",
    assigned_to: "QC001",
    frequency: "daily" as QCSchedule["frequency"],
    scheduled_date: new Date().toISOString().split("T")[0],
    scheduled_time_start: "08:00",
    scheduled_time_end: "09:00",
    template_id: "",
  });

  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.machine_name || !form.scheduled_date) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }
    const officer = QC_OFFICER_MAP[form.assigned_to];
    const tpl = MOCK_CHECKSHEET_TEMPLATES.find((t) => t.template_id === form.template_id);
    const newSchedule: QCSchedule = {
      schedule_id: `QCS-${Date.now()}`,
      title: form.title,
      frequency: form.frequency,
      machine_name: form.machine_name,
      machine_id: form.machine_id || form.machine_name,
      zone: form.zone,
      assigned_to: form.assigned_to,
      assigned_to_name: officer?.name ?? form.assigned_to,
      scheduled_date: form.scheduled_date,
      scheduled_time_start: form.scheduled_time_start,
      scheduled_time_end: form.scheduled_time_end,
      status: "scheduled",
      template_id: form.template_id || undefined,
      template_name: tpl?.name,
    };
    onSave(newSchedule);
    toast.success("สร้างตาราง QC สำเร็จ");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-card">
          <h3 className="font-bold text-base">สร้างตาราง QC ใหม่</h3>
          <p className="text-xs text-muted-foreground mt-0.5">กำหนดการตรวจ QC สำหรับเครื่องจักร</p>
        </div>
        <div className="p-6 space-y-4">
          <Field label="หัวข้อการตรวจ *">
            <Input placeholder="เช่น ตรวจ QC เครื่องจักรประจำวัน Line A" value={form.title} onChange={(e) => upd("title", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ชื่อเครื่องจักร *">
              <Input placeholder="เช่น MCH-PR-2041" value={form.machine_name} onChange={(e) => upd("machine_name", e.target.value)} />
            </Field>
            <Field label="Machine ID">
              <Input placeholder="เช่น MCH-PR-2041" value={form.machine_id} onChange={(e) => upd("machine_id", e.target.value)} />
            </Field>
          </div>
          <Field label="Zone / สถานที่">
            <Input placeholder="เช่น Line A — อาคารผลิต" value={form.zone} onChange={(e) => upd("zone", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ความถี่">
              <select className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.frequency} onChange={(e) => upd("frequency", e.target.value)}>
                <option value="daily">รายวัน</option>
                <option value="monthly">รายเดือน</option>
              </select>
            </Field>
            <Field label="ผู้รับผิดชอบ">
              <select className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.assigned_to} onChange={(e) => upd("assigned_to", e.target.value)}>
                {Object.values(QC_OFFICER_MAP).map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="วันที่ตรวจ *">
            <Input type="date" value={form.scheduled_date} onChange={(e) => upd("scheduled_date", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="เวลาเริ่ม">
              <Input type="time" value={form.scheduled_time_start} onChange={(e) => upd("scheduled_time_start", e.target.value)} />
            </Field>
            <Field label="เวลาสิ้นสุด">
              <Input type="time" value={form.scheduled_time_end} onChange={(e) => upd("scheduled_time_end", e.target.value)} />
            </Field>
          </div>
          <Field label="Checksheet Template (ถ้ามี)">
            <select className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.template_id} onChange={(e) => upd("template_id", e.target.value)}>
              <option value="">— ไม่เลือก —</option>
              {MOCK_CHECKSHEET_TEMPLATES.filter((t) => t.active).map((t) => (
                <option key={t.template_id} value={t.template_id}>{t.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-card">
          <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
          <Button className="flex-1" onClick={handleSave}>
            <Plus className="h-4 w-4 mr-1" />สร้างตาราง QC
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

function ScheduleDetailDrawer({
  item,
  onClose,
  onCheckIn,
  onCheckOut,
  onViewRecord,
}: {
  item: QCSchedule;
  onClose: () => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
  onViewRecord: (id: string) => void;
}) {
  const s = STATUS_CONFIG[item.status];

  function calcDuration(start?: string, end?: string): string {
    if (!start || !end) return "-";
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    return `${Math.round(diff)} นาที`;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border-l shadow-2xl flex flex-col">
        <div className="p-5 border-b flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-mono">{item.schedule_id}</p>
            <h3 className="font-bold text-base mt-0.5">{item.title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><XCircle className="h-5 w-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border", s.cls)}>
            {s.icon}{s.label}
          </span>

          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <InfoRow label="เครื่องจักร" value={item.machine_name} />
            <InfoRow label="Machine ID" value={item.machine_id} mono />
            <InfoRow label="Zone" value={item.zone || "-"} />
            <InfoRow label="ผู้รับผิดชอบ" value={item.assigned_to_name} />
            <InfoRow label="ความถี่" value={FREQ_LABEL[item.frequency]} />
          </div>

          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <InfoRow label="วันที่กำหนด" value={item.scheduled_date} />
            <InfoRow label="เวลากำหนด" value={`${item.scheduled_time_start} – ${item.scheduled_time_end}`} />
            {item.checked_in_at && <InfoRow label="เวลา Check-in" value={new Date(item.checked_in_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} />}
            {item.checked_out_at && <InfoRow label="เวลา Check-out" value={new Date(item.checked_out_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} />}
            {item.checked_in_at && item.checked_out_at && (
              <InfoRow label="ระยะเวลาตรวจ" value={calcDuration(item.checked_in_at, item.checked_out_at)} bold />
            )}
          </div>

          {item.template_name && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs font-medium text-blue-700 mb-0.5">Checksheet ที่ใช้</p>
              <p className="text-sm text-blue-900 font-semibold">{item.template_name}</p>
              {item.record_id && <p className="text-xs text-blue-600 mt-0.5 font-mono">{item.record_id}</p>}
            </div>
          )}

          {item.findings && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">ผลการตรวจ / สิ่งที่พบ</p>
              <p className="text-sm bg-muted/40 rounded-lg p-3">{item.findings}</p>
            </div>
          )}

          {item.work_request_id && (
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-orange-700 font-medium">ใบแจ้งซ่อมที่เกี่ยวข้อง</p>
                <p className="text-xs font-mono text-orange-900">{item.work_request_id}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-card space-y-2">
          {item.status === "scheduled" && (
            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
              onClick={() => onCheckIn(item.schedule_id)}
            >
              <Clock className="h-4 w-4" /> เริ่มตรวจ (Check-in)
            </Button>
          )}
          {item.status === "in-progress" && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => onCheckOut(item.schedule_id)}
            >
              <CheckCircle2 className="h-4 w-4" /> บันทึกเสร็จสิ้น (Check-out)
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => onViewRecord(item.schedule_id)}
          >
            <ExternalLink className="h-4 w-4" /> ดูบันทึก QC ฉบับเต็ม / แบบตรวจ
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-right", mono && "font-mono text-primary", bold && "font-bold")}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QCDashboard() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<QCSchedule[]>(MOCK_QC_SCHEDULES);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<QCSchedule | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QCScheduleStatus | "all">("all");
  const [freqFilter, setFreqFilter] = useState<"all" | "daily" | "monthly">("all");
  const [activeTab, setActiveTab] = useState<"schedule" | "stats">("schedule");

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const matchSearch = !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.machine_name.toLowerCase().includes(search.toLowerCase()) ||
        s.assigned_to_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchFreq = freqFilter === "all" || s.frequency === freqFilter;
      return matchSearch && matchStatus && matchFreq;
    });
  }, [schedules, search, statusFilter, freqFilter]);

  const kpi = useMemo(() => {
    const dailySchedules = schedules.filter((s) => s.frequency === "daily");
    const monthlySchedules = schedules.filter((s) => s.frequency === "monthly");
    const dailyDone = dailySchedules.filter((s) => s.status === "done").length;
    const monthlyDone = monthlySchedules.filter((s) => s.status === "done").length;

    return {
      total: schedules.length,
      done: schedules.filter((s) => s.status === "done").length,
      scheduled: schedules.filter((s) => s.status === "scheduled").length,
      missed: schedules.filter((s) => s.status === "missed").length,
      compliance: schedules.length > 0
        ? Math.round((schedules.filter((s) => s.status === "done").length / schedules.length) * 100)
        : 0,
      dailyCompliance: dailySchedules.length > 0 ? Math.round((dailyDone / dailySchedules.length) * 100) : 0,
      monthlyCompliance: monthlySchedules.length > 0 ? Math.round((monthlyDone / monthlySchedules.length) * 100) : 0,
      issuesFound: schedules.filter((s) => !!s.findings || !!s.work_request_id).length,
    };
  }, [schedules]);

  const problematicMachines = useMemo(() => {
    const map: Record<string, { name: string; count: number; lastIssue?: string }> = {};
    schedules.forEach((s) => {
      if (s.findings || s.work_request_id || s.status === "missed") {
        if (!map[s.machine_name]) {
          map[s.machine_name] = {
            name: s.machine_name,
            count: 0,
            lastIssue: s.findings || (s.status === "missed" ? "ขาดการตรวจตามกำหนด" : "แจ้งซ่อมแล้ว"),
          };
        }
        map[s.machine_name].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [schedules]);

  const handleCheckIn = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.schedule_id === scheduleId
          ? { ...s, status: "in-progress", checked_in_at: new Date().toISOString() }
          : s
      )
    );
    setSelected((prev) =>
      prev && prev.schedule_id === scheduleId
        ? { ...prev, status: "in-progress", checked_in_at: new Date().toISOString() }
        : prev
    );
    toast.success("Check-in เริ่มการตรวจ QC สำเร็จ");
  };

  const handleCheckOut = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.schedule_id === scheduleId
          ? { ...s, status: "done", checked_out_at: new Date().toISOString() }
          : s
      )
    );
    setSelected(null);
    toast.success("บันทึกเสร็จสิ้นการตรวจ QC เรียบร้อย");
  };

  const handleViewRecord = (scheduleId: string) => {
    navigate(`/qc/record/${scheduleId}`);
  };

  // Group by date for schedule view
  const grouped = useMemo(() => {
    const map: Record<string, QCSchedule[]> = {};
    [...filtered]
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .forEach((s) => {
        (map[s.scheduled_date] ??= []).push(s);
      });
    return map;
  }, [filtered]);

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const label = iso === today ? "วันนี้" : iso === tomorrow ? "พรุ่งนี้" : "";
    return d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + (label ? ` (${label})` : "");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-primary text-primary-foreground shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center shrink-0">
            <ClipboardCheck className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-primary-foreground/70">QC Dashboard</div>
            <h1 className="font-bold truncate">ระบบตาราง QC</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">Compliance {kpi.compliance}%</span>
            {kpi.missed > 0 && (
              <span className="rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-xs font-semibold">
                ไม่ได้ตรวจ {kpi.missed}
              </span>
            )}
          </div>
          <Button className="gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 border" size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />สร้างตาราง
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={() => navigate("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "ทั้งหมด", value: kpi.total, cls: "border-l-primary" },
            { label: "ตรวจแล้ว", value: kpi.done, cls: "border-l-emerald-500" },
            { label: "รอตรวจ", value: kpi.scheduled, cls: "border-l-blue-500" },
            { label: "ไม่ได้ตรวจ", value: kpi.missed, cls: "border-l-red-500" },
            { label: "Compliance", value: `${kpi.compliance}%`, cls: kpi.compliance >= 80 ? "border-l-emerald-500" : "border-l-amber-500" },
          ].map((k) => (
            <Card key={k.label} className={cn("p-4 border-l-4", k.cls)}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold tabular-nums">{k.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {[{ key: "schedule", label: "📅 ตารางการตรวจ" }, { key: "stats", label: "📊 สรุปรายบุคคล" }].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as "schedule" | "stats")}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <>
            {/* Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-9" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as QCScheduleStatus | "all")}>
                  <option value="all">ทุกสถานะ</option>
                  <option value="scheduled">รอตรวจ</option>
                  <option value="in-progress">กำลังตรวจ</option>
                  <option value="done">ตรวจแล้ว</option>
                  <option value="missed">ไม่ได้ตรวจ</option>
                </select>
                <select className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={freqFilter} onChange={(e) => setFreqFilter(e.target.value as "all" | "daily" | "monthly")}>
                  <option value="all">ทุกความถี่</option>
                  <option value="daily">รายวัน</option>
                  <option value="monthly">รายเดือน</option>
                </select>
              </div>
            </Card>

            {/* Schedule by date */}
            <div className="space-y-6">
              {Object.keys(grouped).length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">ไม่พบรายการ</Card>
              ) : (
                Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{formatDate(date)}</h3>
                      <span className="text-xs text-muted-foreground ml-auto">{items.length} รายการ</span>
                    </div>
                    <div className="space-y-2">
                      {items
                        .sort((a, b) => a.scheduled_time_start.localeCompare(b.scheduled_time_start))
                        .map((item) => {
                          const s = STATUS_CONFIG[item.status];
                          return (
                            <Card
                              key={item.schedule_id}
                              className={cn(
                                "p-4 cursor-pointer transition-all hover:shadow-md border-l-4",
                                item.status === "done" ? "border-l-emerald-400" :
                                item.status === "missed" ? "border-l-red-400" :
                                item.status === "in-progress" ? "border-l-cyan-400" : "border-l-blue-400"
                              )}
                              onClick={() => setSelected(item)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-center shrink-0 min-w-[48px]">
                                  <p className="text-xs font-mono font-bold text-primary">{item.scheduled_time_start}</p>
                                  <p className="text-[10px] text-muted-foreground">– {item.scheduled_time_end}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <p className="font-semibold text-sm">{item.title}</p>
                                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border", s.cls)}>
                                      {s.icon}{s.label}
                                    </span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{FREQ_LABEL[item.frequency]}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.machine_name}</span>
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.assigned_to_name}</span>
                                    {item.checked_in_at && (
                                      <span className="flex items-center gap-1 text-emerald-600">
                                        <Clock className="h-3 w-3" />
                                        เข้า {new Date(item.checked_in_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                                        {item.checked_out_at && ` — ออก ${new Date(item.checked_out_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`}
                                      </span>
                                    )}
                                  </div>
                                  {item.findings && (
                                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1.5 inline-block">⚠ {item.findings}</p>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 border-l-4 border-l-primary">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Compliance รายวัน vs รายเดือน</p>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-xs text-muted-foreground">รายวัน</span>
                    <p className="text-2xl font-bold tabular-nums text-primary">{kpi.dailyCompliance}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">รายเดือน</span>
                    <p className="text-2xl font-bold tabular-nums text-cyan-600">{kpi.monthlyCompliance}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-l-4 border-l-amber-500">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">จำนวนครั้งที่พบปัญหา</p>
                <p className="text-3xl font-bold tabular-nums text-amber-600 mt-2">
                  {kpi.issuesFound} <span className="text-sm font-normal text-muted-foreground">ครั้ง</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">จากทั้งหมด {kpi.total} กำหนดการตรวจ</p>
              </Card>

              <Card className="p-5 border-l-4 border-l-red-500">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">เครื่องจักรที่ต้องเฝ้าระวัง</p>
                <p className="text-3xl font-bold tabular-nums text-red-600 mt-2">
                  {problematicMachines.length} <span className="text-sm font-normal text-muted-foreground">เครื่อง</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">พบปัญหาหรือขาดการตรวจตามแผน</p>
              </Card>
            </div>

            {/* Problematic Machines Card */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-sm">เครื่องจักรที่พบปัญหาบ่อย / ขาดตรวจ</h3>
              </div>
              <div className="space-y-2.5">
                {problematicMachines.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">ไม่พบเครื่องจักรที่มีปัญหา 👍</p>
                ) : (
                  problematicMachines.map((m, idx) => (
                    <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-muted-foreground w-4 text-center shrink-0">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{m.name}</p>
                          <p className="text-amber-700 mt-0.5 truncate">⚠️ {m.lastIssue}</p>
                        </div>
                      </div>
                      <span className="font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0 ml-2">
                        พบ {m.count} ครั้ง
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Officer Performance */}
            <div>
              <h3 className="font-semibold text-sm mb-3">สรุปผลการตรวจรายบุคคล</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.values(QC_OFFICER_MAP).map((officer) => {
                  const mySchedules = schedules.filter((s) => s.assigned_to === officer.id);
                  const doneCnt = mySchedules.filter((s) => s.status === "done").length;
                  const missedCnt = mySchedules.filter((s) => s.status === "missed").length;
                  const rate = mySchedules.length > 0 ? Math.round((doneCnt / mySchedules.length) * 100) : 0;
                  return (
                    <Card key={officer.id} className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-sm shrink-0">
                          {officer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{officer.name}</p>
                          <p className="text-xs text-muted-foreground">{officer.id}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Compliance Rate</span>
                          <span className="font-bold">{rate}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", rate >= 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-md bg-muted py-2">
                          <p className="text-base font-bold">{mySchedules.length}</p>
                          <p className="text-muted-foreground">ทั้งหมด</p>
                        </div>
                        <div className="rounded-md bg-emerald-50 py-2">
                          <p className="text-base font-bold text-emerald-700">{doneCnt}</p>
                          <p className="text-emerald-600">ตรวจแล้ว</p>
                        </div>
                        <div className="rounded-md bg-red-50 py-2">
                          <p className="text-base font-bold text-red-700">{missedCnt}</p>
                          <p className="text-red-600">ไม่ได้ตรวจ</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {showNew && <NewScheduleModal onClose={() => setShowNew(false)} onSave={(s) => setSchedules((prev) => [s, ...prev])} />}
      {selected && (
        <ScheduleDetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onViewRecord={handleViewRecord}
        />
      )}
    </div>
  );
}
