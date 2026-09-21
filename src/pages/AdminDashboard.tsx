import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Wrench,
  LogOut,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequests } from "@/lib/requestStore";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  PRIORITY_LABEL,
  TECHNICIAN_MAP,
  timeAgo,
  WorkRequest,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  critical: "hsl(0 78% 48%)",
  high: "hsl(25 95% 53%)",
  medium: "hsl(210 85% 50%)",
  low: "hsl(215 14% 55%)",
};

const STATUS_BAR_COLOR: Record<string, string> = {
  open: "#38bdf8",
  assess: "#f59e0b",
  waiting: "#f43f5e",
  doing: "#22d3ee",
  done: "#f97316",
  qc1: "#8b5cf6",
  qc2: "#d946ef",
  complete: "#10b981",
};

// ─── Nav items ────────────────────────────────────────────────────────────────
type NavKey = "overview" | "pipeline" | "team";

const NAV_ITEMS: { key: NavKey; label: string; sublabel: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    label: "ภาพรวม",
    sublabel: "KPIs & กราฟ",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    key: "pipeline",
    label: "สถานะงาน",
    sublabel: "Pipeline & งานค้าง",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    key: "team",
    label: "ทีมช่าง",
    sublabel: "ประสิทธิภาพ",
    icon: <Users className="h-5 w-5" />,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hoursAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accentClass?: string;
  pulse?: boolean;
}
function KpiCard({ icon, label, value, sub, accentClass, pulse }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-5 border-l-4 bg-card transition-shadow hover:shadow-md", accentClass ?? "border-l-primary")}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tabular-nums leading-none">{value}</p>
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className="h-11 w-11 rounded-xl grid place-items-center shrink-0 bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
      {pulse && <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-priority-critical priority-pulse" />}
    </Card>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <h2 className="font-semibold text-base">{title}</h2>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; fill?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.fill }}>
          {entry.name ?? "จำนวน"}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

function PriorityPill({ priority }: { priority: WorkRequest["priority"] }) {
  const cls: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-gray-100 text-gray-600",
  };
  const lbl: Record<string, string> = {
    critical: "🔴 วิกฤติ", high: "🟠 สูง", medium: "🔵 ปานกลาง", low: "⚪ ต่ำ",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", cls[priority])}>
      {lbl[priority]}
    </span>
  );
}

function StatusPill({ status }: { status: WorkRequest["status"] }) {
  const cls: Record<string, string> = {
    open: "bg-sky-100 text-sky-700",
    assess: "bg-amber-100 text-amber-700",
    waiting: "bg-rose-100 text-rose-700",
    doing: "bg-cyan-100 text-cyan-700",
    done: "bg-orange-100 text-orange-700",
    qc1: "bg-violet-100 text-violet-700",
    qc2: "bg-fuchsia-100 text-fuchsia-700",
    complete: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Page Sections ────────────────────────────────────────────────────────────
function OverviewSection({
  kpi,
  categoryData,
  priorityData,
}: {
  kpi: ReturnType<typeof useKpi>;
  categoryData: { name: string; count: number }[];
  priorityData: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <section>
        <SectionTitle icon={<BarChart3 className="h-4 w-4" />} title="ตัวชี้วัดหลัก (KPIs)" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={<BarChart3 className="h-5 w-5" />} label="งานทั้งหมด" value={kpi.total} sub="ทุกสถานะรวมกัน" accentClass="border-l-primary" />
          <KpiCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} label="งานวิกฤติ" value={kpi.critical} sub="ต้องดำเนินการทันที" accentClass="border-l-red-500" pulse={kpi.critical > 0} />
          <KpiCard icon={<Clock className="h-5 w-5 text-orange-500" />} label="ค้างเกิน 24 ชม." value={kpi.overdue} sub="ยังไม่เสร็จ" accentClass="border-l-orange-500" />
          <KpiCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="เสร็จสิ้นแล้ว" value={kpi.complete} sub={`${kpi.completionRate}% ของงาน`} accentClass="border-l-emerald-500" />
          <KpiCard icon={<Package className="h-5 w-5 text-violet-500" />} label="รออะไหล่" value={kpi.waiting} sub="รอจัดซื้อ/จัดส่ง" accentClass="border-l-violet-500" />
          <KpiCard icon={<TrendingUp className="h-5 w-5 text-cyan-600" />} label="MTTR (จำลอง)" value={`${kpi.mockMttr} ชม.`} sub="เฉลี่ยเวลาซ่อม" accentClass="border-l-cyan-500" />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle icon={<BarChart3 className="h-4 w-4" />} title="จำนวนงานแยกตามหมวดหมู่" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 18% 87%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={48} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="hsl(215 60% 40%)" radius={[4, 4, 0, 0]} name="จำนวนงาน" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={<AlertTriangle className="h-4 w-4" />} title="สัดส่วนความสำคัญของงาน" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} cx="45%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-xs">
                      <p style={{ color: payload[0].payload.color }} className="font-semibold">{payload[0].name}</p>
                      <p>จำนวน: <strong>{payload[0].value}</strong></p>
                    </div>
                  ) : null
                }
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>
    </div>
  );
}

function PipelineSection({
  statusPipeline,
  urgentJobs,
  maxPipelineCount,
}: {
  statusPipeline: { key: string; label: string; count: number }[];
  urgentJobs: WorkRequest[];
  maxPipelineCount: number;
}) {
  return (
    <div className="space-y-8">
      {/* Pipeline */}
      <section>
        <SectionTitle icon={<ChevronRight className="h-4 w-4" />} title="Status Pipeline — การไหลของงาน" />
        <Card className="p-5">
          <div className="space-y-3">
            {statusPipeline.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-32 shrink-0 text-xs font-medium text-right text-muted-foreground">{s.label}</div>
                <div className="flex-1 bg-muted rounded-full h-7 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-700"
                    style={{
                      width: `${Math.max((s.count / maxPipelineCount) * 100, s.count > 0 ? 6 : 0)}%`,
                      backgroundColor: STATUS_BAR_COLOR[s.key],
                    }}
                  >
                    {s.count > 0 && s.count}
                  </div>
                </div>
                <div className={cn("w-7 text-xs font-semibold tabular-nums text-right", s.count === 0 && "text-muted-foreground")}>{s.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Urgent table */}
      <section>
        <SectionTitle icon={<AlertTriangle className="h-4 w-4" />} title="งานวิกฤติ / งานสำคัญที่ต้องติดตาม" />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">รหัสงาน</th>
                  <th className="px-4 py-3 text-left font-medium">ทรัพย์สิน</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">ปัญหา</th>
                  <th className="px-4 py-3 text-left font-medium">ความสำคัญ</th>
                  <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                  <th className="px-4 py-3 text-left font-medium">รอมา</th>
                </tr>
              </thead>
              <tbody>
                {urgentJobs.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">ไม่มีงานวิกฤติ / สำคัญขณะนี้</td></tr>
                ) : (
                  urgentJobs.map((r, i) => (
                    <tr key={r.request_id} className={cn("border-b last:border-0 transition-colors hover:bg-muted/30", i % 2 !== 0 && "bg-muted/10")}>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{r.request_id}</td>
                      <td className="px-4 py-3 font-medium">{r.asset_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell max-w-[180px] truncate">{r.issue_summary}</td>
                      <td className="px-4 py-3"><PriorityPill priority={r.priority} /></td>
                      <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{timeAgo(r.reported_time)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function TeamSection({ techPerf }: { techPerf: ReturnType<typeof useTechPerf> }) {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">งานที่รับผิดชอบแต่ละคน</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={techPerf.map((t) => ({ name: t.name, รับงาน: t.total, เสร็จ: t.done, ดำเนินการ: t.inProgress }))}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 18% 87%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="รับงาน" fill="hsl(215 60% 40%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="เสร็จ" fill="hsl(142 65% 38%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="ดำเนินการ" fill="hsl(38 92% 50%)" radius={[3, 3, 0, 0]} />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {techPerf.map((tech) => {
          const pct = tech.total > 0 ? Math.round((tech.done / tech.total) * 100) : 0;
          return (
            <Card key={tech.id} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-bold text-sm shrink-0">
                  {tech.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.id}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">อัตราปิดงาน</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-muted py-2">
                  <p className="text-base font-bold tabular-nums">{tech.total}</p>
                  <p className="text-muted-foreground">รับงาน</p>
                </div>
                <div className="rounded-md bg-emerald-50 py-2">
                  <p className="text-base font-bold text-emerald-700 tabular-nums">{tech.done}</p>
                  <p className="text-emerald-600">เสร็จ</p>
                </div>
                <div className="rounded-md bg-amber-50 py-2">
                  <p className="text-base font-bold text-amber-700 tabular-nums">{tech.pending}</p>
                  <p className="text-amber-600">ค้างงาน</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom hooks for data ────────────────────────────────────────────────────
function useKpi(requests: WorkRequest[]) {
  return useMemo(() => {
    const total = requests.length;
    const critical = requests.filter((r) => r.priority === "critical").length;
    const overdue = requests.filter((r) => r.status !== "complete" && hoursAgo(r.reported_time) > 24).length;
    const complete = requests.filter((r) => r.status === "complete").length;
    const waiting = requests.filter((r) => r.status === "waiting").length;
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;
    return { total, critical, overdue, complete, waiting, completionRate, mockMttr: 3.2 };
  }, [requests]);
}

function useTechPerf(requests: WorkRequest[]) {
  return useMemo(() =>
    Object.values(TECHNICIAN_MAP).map((tech) => {
      const mine = requests.filter((r) => r.assigned_to === tech.technician_id);
      return {
        id: tech.technician_id,
        name: tech.name,
        total: mine.length,
        done: mine.filter((r) => r.status === "complete").length,
        inProgress: mine.filter((r) => r.status === "doing").length,
        pending: mine.filter((r) => ["open", "assess", "waiting"].includes(r.status)).length,
      };
    }), [requests]);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const requests = useRequests();
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const kpi = useKpi(requests);
  const techPerf = useTechPerf(requests);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach((r) => { map[r.category] = (map[r.category] ?? 0) + 1; });
    return Object.entries(map)
      .map(([key, count]) => ({ name: (CATEGORY_LABEL as Record<string, string>)[key] ?? key, count }))
      .sort((a, b) => b.count - a.count);
  }, [requests]);

  const priorityData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach((r) => { map[r.priority] = (map[r.priority] ?? 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({
      name: (PRIORITY_LABEL as Record<string, string>)[key] ?? key,
      value,
      color: PRIORITY_COLORS[key] ?? "#888",
    }));
  }, [requests]);

  const statusPipeline = useMemo(() => {
    const ORDER = ["open", "assess", "waiting", "doing", "done", "qc1", "qc2", "complete"] as const;
    return ORDER.map((s) => ({ key: s, label: STATUS_LABEL[s], count: requests.filter((r) => r.status === s).length }));
  }, [requests]);

  const urgentJobs = useMemo(() =>
    requests
      .filter((r) => r.status !== "complete" && (r.priority === "critical" || r.priority === "high"))
      .sort((a, b) => hoursAgo(b.reported_time) - hoursAgo(a.reported_time))
      .slice(0, 8),
    [requests]);

  const maxPipelineCount = Math.max(...statusPipeline.map((s) => s.count), 1);

  const activeNavItem = NAV_ITEMS.find((n) => n.key === activeNav)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-gradient-primary text-primary-foreground shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-white/10"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="เปิด/ปิดเมนู"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center shrink-0">
            <Wrench className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-primary-foreground/70">Admin Dashboard</div>
            <h1 className="font-bold truncate">ผู้จัดการฝ่ายซ่อมบำรุง · ADMIN001</h1>
          </div>

          {/* KPI chips — hidden on small screens */}
          <div className="hidden xl:flex items-center gap-2">
            {kpi.critical > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/40 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-400 priority-pulse" />
                วิกฤติ {kpi.critical}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              ทั้งหมด {kpi.total} งาน
            </span>
          </div>

          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={() => navigate("/")} aria-label="ออกจากระบบ">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "fixed lg:sticky top-[57px] z-20 h-[calc(100vh-57px)] w-64 shrink-0",
            "flex flex-col bg-sidebar transition-transform duration-300 ease-in-out",
            "border-r border-sidebar-border",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* User card */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-secondary-foreground font-bold text-sm shrink-0">
                ผ
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">ผู้จัดการฝ่ายซ่อมบำรุง</p>
                <p className="text-xs text-sidebar-foreground/60">ADMIN001 · Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-3 py-2">
              เมนูหลัก
            </p>
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className={cn("shrink-0", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60")}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={cn("text-[11px] truncate", isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/50")}>
                      {item.sublabel}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Mini KPI summary at bottom */}
          <div className="p-3 border-t border-sidebar-border space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-1">สรุปด่วน</p>
            {[
              { label: "งานทั้งหมด", value: kpi.total, dot: "bg-primary" },
              { label: "งานวิกฤติ", value: kpi.critical, dot: "bg-red-500" },
              { label: "ค้างเกิน 24 ชม.", value: kpi.overdue, dot: "bg-orange-500" },
              { label: "เสร็จสิ้น", value: kpi.complete, dot: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-1 text-xs text-sidebar-foreground/70">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                  <span>{s.label}</span>
                </div>
                <span className="font-semibold tabular-nums text-sidebar-foreground">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Page title bar */}
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b px-6 py-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded grid place-items-center text-primary">{activeNavItem.icon}</div>
            <div>
              <h2 className="font-semibold text-sm leading-none">{activeNavItem.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeNavItem.sublabel}</p>
            </div>
          </div>

          <div className="p-6 animate-slide-up">
            {activeNav === "overview" && (
              <OverviewSection kpi={kpi} categoryData={categoryData} priorityData={priorityData} />
            )}
            {activeNav === "pipeline" && (
              <PipelineSection statusPipeline={statusPipeline} urgentJobs={urgentJobs} maxPipelineCount={maxPipelineCount} />
            )}
            {activeNav === "team" && <TeamSection techPerf={techPerf} />}
          </div>
        </main>
      </div>
    </div>
  );
}
