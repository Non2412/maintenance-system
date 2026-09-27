import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, LogOut, Clock, CheckCircle2, XCircle,
  AlertTriangle, Wrench, MapPin, User, Calendar,
  FileText, ExternalLink, Camera, ClipboardCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MOCK_QC_SCHEDULES,
  MOCK_CHECKSHEET_TEMPLATES,
  MOCK_CHECKSHEET_RECORDS,
  QCSchedule,
  timeAgo,
} from "@/lib/mockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDurationMin(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

// ─── Check Item Row ───────────────────────────────────────────────────────────

function CheckItem({
  label, result, note,
}: {
  label: string;
  result: "pass" | "fail" | "na" | null;
  note?: string;
}) {
  const cfg = {
    pass: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "ผ่าน" },
    fail: { cls: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="h-3.5 w-3.5" />, label: "ไม่ผ่าน" },
    na:   { cls: "bg-gray-100 text-gray-500 border-gray-200", icon: <XCircle className="h-3.5 w-3.5" />, label: "N/A" },
    null: { cls: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-3.5 w-3.5" />, label: "รอตรวจ" },
  }[result ?? "null"];

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", result === "fail" ? "bg-red-50" : "bg-card")}>
      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border shrink-0 mt-0.5", cfg.cls)}>
        {cfg.icon}{cfg.label}
      </span>
      <div>
        <p className="text-sm">{label}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">หมายเหตุ: {note}</p>}
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("text-right", mono && "font-mono text-primary", bold && "font-bold text-base")}>{value}</span>
    </div>
  );
}

// ─── Simulate check results from schedule ────────────────────────────────────

function buildMockCheckItems(templateId?: string) {
  if (!templateId) return [];
  const tpl = MOCK_CHECKSHEET_TEMPLATES.find((t) => t.template_id === templateId);
  if (!tpl) return [];

  // Simulate some check results based on template items
  return tpl.items.map((item, i) => ({
    label: item.label,
    result: (["pass", "pass", "pass", "fail", "na"][i % 5] as "pass" | "fail" | "na"),
    note: i % 5 === 3 ? "พบสัญญาณเสียงผิดปกติ ต้องติดตาม" : undefined,
  }));
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QCRecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const schedule = id ? MOCK_QC_SCHEDULES.find((s) => s.schedule_id === id) : undefined;

  if (!schedule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-semibold">ไม่พบบันทึก QC</p>
        <p className="text-sm text-muted-foreground text-center">Schedule ID: {id}</p>
        <Button onClick={() => navigate("/qc/dashboard")}>กลับ QC Dashboard</Button>
      </div>
    );
  }

  const STATUS_CONFIG: Record<QCSchedule["status"], { label: string; cls: string; icon: React.ReactNode }> = {
    scheduled:     { label: "กำหนดการ",  cls: "bg-blue-100 text-blue-700 border-blue-200",       icon: <Calendar className="h-3.5 w-3.5" /> },
    "in-progress": { label: "กำลังตรวจ", cls: "bg-cyan-100 text-cyan-700 border-cyan-200",       icon: <Clock className="h-3.5 w-3.5" /> },
    done:          { label: "ตรวจแล้ว",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    missed:        { label: "ไม่ได้ตรวจ", cls: "bg-red-100 text-red-700 border-red-200",         icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const s = STATUS_CONFIG[schedule.status];
  const durationMin = calcDurationMin(schedule.checked_in_at, schedule.checked_out_at);
  const checkItems = buildMockCheckItems(schedule.template_id);
  const failCount = checkItems.filter((c) => c.result === "fail").length;
  const passCount = checkItems.filter((c) => c.result === "pass").length;
  const passRate = checkItems.length > 0 ? Math.round((passCount / checkItems.filter((c) => c.result !== "na").length) * 100) : null;

  const tpl = schedule.template_id
    ? MOCK_CHECKSHEET_TEMPLATES.find((t) => t.template_id === schedule.template_id)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-primary text-primary-foreground shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={() => navigate("/qc/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center shrink-0">
            <ClipboardCheck className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-primary-foreground/70 font-mono">{schedule.schedule_id}</div>
            <h1 className="font-bold truncate">{schedule.title}</h1>
          </div>
          <span className={cn("hidden sm:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border", s.cls)}>
            {s.icon}{s.label}
          </span>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={() => navigate("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">

        {/* Overview Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{schedule.machine_name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{schedule.zone || "ไม่ระบุ Zone"}</span>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{schedule.assigned_to_name}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{schedule.scheduled_date}</span>
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold border shrink-0", s.cls)}>
              {s.icon}{s.label}
            </span>
          </div>

          {/* Time info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            {[
              { label: "เวลากำหนด", value: `${schedule.scheduled_time_start}–${schedule.scheduled_time_end}`, cls: "bg-muted" },
              { label: "Check-in", value: formatTime(schedule.checked_in_at), cls: schedule.checked_in_at ? "bg-cyan-50" : "bg-muted" },
              { label: "Check-out", value: formatTime(schedule.checked_out_at), cls: schedule.checked_out_at ? "bg-cyan-50" : "bg-muted" },
              { label: "ระยะเวลา", value: durationMin != null ? `${durationMin} นาที` : "—", cls: durationMin ? "bg-emerald-50" : "bg-muted" },
            ].map((item) => (
              <div key={item.label} className={cn("rounded-xl py-3 px-2", item.cls)}>
                <p className="text-base font-bold">{item.value}</p>
                <p className="text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Pass Rate */}
        {checkItems.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">ผลการตรวจ QC</h3>
              <div className="flex gap-2 text-xs">
                <span className="bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 font-semibold">✓ ผ่าน {passCount}</span>
                {failCount > 0 && <span className="bg-red-100 text-red-700 rounded-full px-2.5 py-0.5 font-semibold">✗ ไม่ผ่าน {failCount}</span>}
              </div>
            </div>
            {passRate !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">อัตราผ่านการตรวจ</span>
                  <span className={cn("font-bold", passRate >= 80 ? "text-emerald-600" : "text-red-600")}>{passRate}%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", passRate >= 80 ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              {checkItems.map((item, i) => (
                <CheckItem key={i} label={item.label} result={item.result} note={item.note} />
              ))}
            </div>
          </Card>
        )}

        {/* Findings & Notes */}
        {schedule.findings && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-sm">ผลการตรวจ / สิ่งที่พบ</h3>
            </div>
            <p className="text-sm text-foreground bg-amber-50 rounded-lg p-3 border border-amber-100">{schedule.findings}</p>
          </Card>
        )}

        {/* Template Info */}
        {tpl && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-sm">Checksheet ที่ใช้</h3>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-2">
              <p className="font-semibold text-blue-900">{tpl.name}</p>
              <InfoRow label="Template ID" value={tpl.template_id} mono />
              <InfoRow label="หมวดหมู่" value={tpl.category} />
              <InfoRow label="จำนวนรายการตรวจ" value={`${tpl.items.length} รายการ`} />
            </div>
          </Card>
        )}

        {/* Related Work Request */}
        {schedule.work_request_id && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-sm">ใบแจ้งซ่อมที่เกิดจากการตรวจ</h3>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-100 p-4">
              <div className="h-10 w-10 rounded-xl bg-orange-500 grid place-items-center shrink-0">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm text-orange-900 font-semibold">{schedule.work_request_id}</p>
                <p className="text-xs text-orange-700">สร้างจากการตรวจ QC วันที่ {schedule.scheduled_date}</p>
              </div>
              <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => navigate("/board")}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />ดูงาน
              </Button>
            </div>
          </Card>
        )}

        {/* Full details */}
        <Card className="p-5">
          <h3 className="font-semibold text-sm mb-3">ข้อมูลทั้งหมด</h3>
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <InfoRow label="Schedule ID" value={schedule.schedule_id} mono />
            <InfoRow label="เครื่องจักร" value={schedule.machine_name} />
            <InfoRow label="Machine ID" value={schedule.machine_id} mono />
            <InfoRow label="Zone" value={schedule.zone || "—"} />
            <InfoRow label="ผู้รับผิดชอบ" value={schedule.assigned_to_name} />
            <InfoRow label="ความถี่" value={schedule.frequency === "daily" ? "รายวัน" : "รายเดือน"} />
            <InfoRow label="วันที่กำหนด" value={schedule.scheduled_date} />
            <InfoRow label="เวลากำหนด" value={`${schedule.scheduled_time_start} – ${schedule.scheduled_time_end}`} />
            {schedule.checked_in_at && <InfoRow label="เวลา Check-in จริง" value={new Date(schedule.checked_in_at).toLocaleString("th-TH")} />}
            {schedule.checked_out_at && <InfoRow label="เวลา Check-out จริง" value={new Date(schedule.checked_out_at).toLocaleString("th-TH")} />}
            {durationMin !== null && <InfoRow label="ระยะเวลาตรวจ" value={`${durationMin} นาที`} bold />}
          </div>
        </Card>

        {/* Nav */}
        <div className="flex flex-wrap gap-3 pb-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/qc/dashboard")}>
            <ClipboardCheck className="h-4 w-4" />QC Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
