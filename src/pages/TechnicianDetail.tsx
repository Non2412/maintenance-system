import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Wrench, Package, CheckCircle2, Clock, AlertTriangle,
  BarChart3, LogOut, Activity, Star, TrendingUp, Calendar, History,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TECHNICIAN_MAP,
  MOCK_SPARE_PART_REQUESTS,
  STATUS_LABEL,
  CATEGORY_LABEL,
  WorkRequest,
  timeAgo,
} from "@/lib/mockData";
import { useRequests } from "@/lib/requestStore";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "jobs" | "spares" | "done" | "kpi";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "jobs",   label: "งานที่รับ",       icon: <Wrench className="h-4 w-4" /> },
  { key: "spares", label: "งานที่ขออะไหล่",   icon: <Package className="h-4 w-4" /> },
  { key: "done",   label: "งานที่เสร็จแล้ว",  icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: "kpi",    label: "ประสิทธิภาพ",      icon: <BarChart3 className="h-4 w-4" /> },
];

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: WorkRequest["status"] }) {
  const cls: Record<string, string> = {
    open: "bg-sky-100 text-sky-700", assess: "bg-amber-100 text-amber-700",
    waiting: "bg-rose-100 text-rose-700", doing: "bg-cyan-100 text-cyan-700",
    done: "bg-orange-100 text-orange-700", qc1: "bg-violet-100 text-violet-700",
    qc2: "bg-fuchsia-100 text-fuchsia-700", complete: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Job Row ──────────────────────────────────────────────────────────────────

function JobRow({ req, showDuration = false }: { req: WorkRequest; showDuration?: boolean }) {
  const spares = MOCK_SPARE_PART_REQUESTS.filter((sr) => sr.request_id === req.request_id);
  const duration = req.status === "complete" ? (req.priority === "critical" ? 4.2 : req.priority === "high" ? 2.5 : 1.5) : 0;
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="h-8 w-8 rounded-lg bg-muted grid place-items-center shrink-0 mt-0.5">
        <Wrench className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="font-mono text-xs text-primary">{req.request_id}</p>
          <StatusPill status={req.status} />
          {showDuration && duration > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-semibold">
              <Clock className="h-3 w-3" /> เวลาที่ใช้ {duration} ชม.
            </span>
          )}
        </div>
        <p className="text-sm font-medium truncate">{req.asset_name} — {req.issue_summary}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{req.asset_location} · {timeAgo(req.reported_time)}</p>
        {spares.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> อะไหล่:</span>
            {spares.map((sp) => (
              <span key={sp.sr_id} className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-1.5 py-0.2">
                {sp.part_name} ({sp.quantity} {sp.unit})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Section ──────────────────────────────────────────────────────────────

function KpiSection({ requests, techId }: { requests: WorkRequest[]; techId: string }) {
  const mine = requests.filter((r) => r.assigned_to === techId);
  const done = mine.filter((r) => r.status === "complete").length;
  const total = mine.length;
  const inProgress = mine.filter((r) => r.status === "doing").length;
  const pending = mine.filter((r) => ["open", "assess", "waiting"].includes(r.status)).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const categoryBreakdown = Object.entries(
    mine.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([cat, count]) => ({ name: (CATEGORY_LABEL as Record<string, string>)[cat] ?? cat, count }));

  const statusBreakdown = [
    { name: "กำลังดำเนินการ", value: inProgress, fill: "#22d3ee" },
    { name: "ค้างงาน", value: pending, fill: "#f59e0b" },
    { name: "เสร็จสิ้น", value: done, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Mini */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "งานทั้งหมด", value: total, dot: "bg-primary" },
          { label: "เสร็จสิ้น", value: done, dot: "bg-emerald-500" },
          { label: "กำลังดำเนินการ", value: inProgress, dot: "bg-cyan-500" },
          { label: "ค้างงาน", value: pending, dot: "bg-amber-500" },
        ].map((k) => (
          <Card key={k.label} className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={cn("h-2 w-2 rounded-full", k.dot)} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
            </div>
            <p className="text-2xl font-bold tabular-nums">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Completion bar */}
      <Card className="p-5">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium">อัตราปิดงาน</span>
          <span className="font-bold text-emerald-600">{completionRate}%</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">MTTR จำลอง: <strong>3.2 ชั่วโมง</strong></p>
      </Card>

      {/* Category chart */}
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">งานแยกตามหมวดหมู่</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={categoryBreakdown} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 18% 87%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(215 60% 40%)" radius={[4, 4, 0, 0]} name="งาน" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Status breakdown */}
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">สถานะงานปัจจุบัน</p>
        <div className="space-y-2.5">
          {statusBreakdown.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-xs text-right text-muted-foreground">{s.name}</div>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all"
                  style={{ width: `${total > 0 ? Math.max((s.value / total) * 100, s.value > 0 ? 8 : 0) : 0}%`, backgroundColor: s.fill }}
                >
                  {s.value > 0 && s.value}
                </div>
              </div>
              <div className="w-6 text-xs text-right font-semibold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

interface TechnicianDetailProps {
  embedded?: boolean;
  id?: string;
  onBack?: () => void;
}

export default function TechnicianDetail({
  embedded = false,
  id: propId,
  onBack,
}: TechnicianDetailProps = {}) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requests = useRequests();
  const [activeTab, setActiveTab] = useState<Tab>("jobs");

  const id = propId || params.id;
  const tech = id ? TECHNICIAN_MAP[id] : undefined;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!tech) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-semibold">ไม่พบข้อมูลช่าง</p>
        <Button onClick={handleBack}>ย้อนกลับ</Button>
      </div>
    );
  }

  const mine = requests.filter((r) => r.assigned_to === tech.technician_id);
  const doneJobs = mine.filter((r) => r.status === "complete");
  const activeJobs = mine.filter((r) => r.status !== "complete");
  const mySpareRequests = MOCK_SPARE_PART_REQUESTS.filter(
    (sr) => sr.requested_by === tech.technician_id
  );

  const completionRate = mine.length > 0 ? Math.round((doneJobs.length / mine.length) * 100) : 0;

  const bodyContent = (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-secondary grid place-items-center text-secondary-foreground font-bold text-2xl shrink-0 shadow-inner">
            {tech.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold truncate">{tech.name}</h2>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                {tech.department} · {tech.technician_id}
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-semibold">
                ปิดงาน {completionRate}%
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">งานทั้งหมด: {mine.length}</span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-xs">เสร็จ: {doneJobs.length}</span>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 text-xs">กำลังทำ: {activeJobs.filter((r) => r.status === "doing").length}</span>
              {mySpareRequests.length > 0 && (
                <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-xs">
                  ขออะไหล่: {mySpareRequests.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}{tab.label}
              {tab.key === "jobs" && activeJobs.length > 0 && (
                <span className="rounded-full bg-primary/10 text-primary text-xs px-1.5 py-0.5">{activeJobs.length}</span>
              )}
              {tab.key === "spares" && mySpareRequests.filter(s => s.status === "pending").length > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5">{mySpareRequests.filter(s => s.status === "pending").length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Tab: งานที่รับ */}
        {activeTab === "jobs" && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">งานที่รับผิดชอบ ({activeJobs.length} งาน)</p>
            {activeJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ไม่มีงานที่ค้างอยู่ ✅</p>
            ) : (
              activeJobs.map((r) => <JobRow key={r.request_id} req={r} />)
            )}
          </Card>
        )}

        {/* Tab: งานที่ขออะไหล่ */}
        {activeTab === "spares" && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">คำขออะไหล่ ({mySpareRequests.length} รายการ)</p>
            {mySpareRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ยังไม่มีคำขออะไหล่</p>
            ) : (
              <div className="space-y-3">
                {mySpareRequests.map((sr) => {
                  const statusCls: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-700",
                    approved: "bg-blue-100 text-blue-700",
                    rejected: "bg-red-100 text-red-700",
                    ordered: "bg-violet-100 text-violet-700",
                    received: "bg-emerald-100 text-emerald-700",
                  };
                  const statusLbl: Record<string, string> = {
                    pending: "รออนุมัติ", approved: "อนุมัติแล้ว",
                    rejected: "ปฏิเสธ", ordered: "สั่งซื้อแล้ว", received: "ได้รับแล้ว",
                  };
                  return (
                    <div key={sr.sr_id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border">
                      <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="font-mono text-xs text-primary">{sr.sr_id}</p>
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusCls[sr.status])}>{statusLbl[sr.status]}</span>
                          {sr.po_number && <span className="text-xs text-muted-foreground">· {sr.po_number}</span>}
                        </div>
                        <p className="text-sm font-medium">{sr.part_name}</p>
                        <p className="text-xs text-muted-foreground">{sr.quantity} {sr.unit} · ฿{(sr.quantity * sr.unit_price).toLocaleString("th-TH")} · {timeAgo(sr.requested_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Tab: งานที่เสร็จ */}
        {activeTab === "done" && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">งานที่เสร็จสิ้นแล้ว ({doneJobs.length} งาน)</p>
            {doneJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ยังไม่มีงานที่เสร็จ</p>
            ) : (
              doneJobs.map((r) => <JobRow key={r.request_id} req={r} showDuration={true} />)
            )}
          </Card>
        )}

        {/* Tab: KPI */}
        {activeTab === "kpi" && <KpiSection requests={requests} techId={tech.technician_id} />}
      </div>
    </div>
  );

  if (embedded) {
    return bodyContent;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-primary text-primary-foreground shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-secondary-foreground font-bold shrink-0">
            {tech.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-primary-foreground/70">รายละเอียดช่าง · {tech.technician_id}</div>
            <h1 className="font-bold truncate">{tech.name}</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={() => navigate("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {bodyContent}
      </main>
    </div>
  );
}
