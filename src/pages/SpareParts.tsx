import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Search,
  X,
  History,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Filter,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MOCK_SPARE_PARTS_EXTENDED,
  MOCK_SPARE_PART_TRANSACTIONS,
  SPARE_PART_CATEGORY_LABEL,
  SparePartExtended,
  SparePartTransaction,
  SparePartCategory,
  timeAgo,
} from "@/lib/mockData";

function getStockStatus(part: SparePartExtended): "out" | "low" | "ok" {
  if (part.stock === 0) return "out";
  if (part.stock < part.min_stock) return "low";
  return "ok";
}

function stockPct(part: SparePartExtended): number {
  return Math.min(Math.round((part.stock / part.max_stock) * 100), 100);
}

function formatPrice(n: number) {
  return n.toLocaleString("th-TH");
}

function StockBadge({ status }: { status: "out" | "low" | "ok" }) {
  const map = {
    out: "bg-red-100 text-red-700 border-red-200",
    low: "bg-amber-100 text-amber-700 border-amber-200",
    ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const labels = { out: "หมดสต็อก", low: "ใกล้หมด", ok: "ปกติ" };
  const icons = { out: "🔴", low: "🟡", ok: "🟢" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", map[status])}>
      {icons[status]} {labels[status]}
    </span>
  );
}

function TxTypeBadge({ type }: { type: SparePartTransaction["type"] }) {
  if (type === "issue") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-semibold">
      <ArrowUpFromLine className="h-3 w-3" /> เบิก
    </span>
  );
  if (type === "receive") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
      <ArrowDownToLine className="h-3 w-3" /> รับเข้า
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-semibold">
      ปรับสต็อก
    </span>
  );
}

interface IssueReceiveModalProps {
  part: SparePartExtended;
  mode: "issue" | "receive";
  onClose: () => void;
  onConfirm: (qty: number, note: string, reqId: string) => void;
}

function IssueReceiveModal({ part, mode, onClose, onConfirm }: IssueReceiveModalProps) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [reqId, setReqId] = useState("");
  const isIssue = mode === "issue";
  const maxQty = isIssue ? part.stock : 999;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border shadow-2xl overflow-hidden">
        <div className={cn("px-6 py-4 flex items-center justify-between", isIssue ? "bg-rose-500" : "bg-emerald-500")}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
              {isIssue ? <ArrowUpFromLine className="h-4 w-4 text-white" /> : <ArrowDownToLine className="h-4 w-4 text-white" />}
            </div>
            <div>
              <p className="text-xs text-white/70">{isIssue ? "เบิกอะไหล่" : "รับอะไหล่เข้า"}</p>
              <p className="font-bold text-white text-sm truncate max-w-[220px]">{part.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm flex justify-between">
            <span className="text-muted-foreground">Stock ปัจจุบัน</span>
            <span className="font-bold">{part.stock} {part.unit}</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">จำนวน ({part.unit})</label>
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-md border bg-muted hover:bg-muted/80 font-bold transition-colors" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
              <input
                type="number" min={1} max={maxQty} value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="h-9 w-9 rounded-md border bg-muted hover:bg-muted/80 font-bold transition-colors" onClick={() => setQty((v) => Math.min(maxQty, v + 1))}>+</button>
            </div>
            {isIssue && qty > part.stock && <p className="text-xs text-red-500 mt-1">⚠ จำนวนเกิน stock ที่มีอยู่</p>}
          </div>
          {isIssue && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">รหัสใบแจ้งซ่อม (ถ้ามี)</label>
              <Input placeholder="เช่น REQ-20260422-001" value={reqId} onChange={(e) => setReqId(e.target.value)} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">หมายเหตุ</label>
            <textarea rows={2} placeholder={isIssue ? "ระบุงานที่ใช้อะไหล่..." : "ระบุแหล่งที่มา / PO..."} value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className={cn("rounded-lg border p-3 text-sm", isIssue ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50")}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stock หลังดำเนินการ</span>
              <span className={cn("font-bold", isIssue ? "text-rose-700" : "text-emerald-700")}>
                {isIssue ? part.stock - qty : part.stock + qty} {part.unit}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
            <Button
              className={cn("flex-1", isIssue ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white")}
              disabled={isIssue && qty > part.stock}
              onClick={() => onConfirm(qty, note, reqId)}
            >
              {isIssue ? "ยืนยันการเบิก" : "ยืนยันรับเข้า"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpareParts() {
  const navigate = useNavigate();
  const [parts, setParts] = useState<SparePartExtended[]>(MOCK_SPARE_PARTS_EXTENDED);
  const [transactions, setTransactions] = useState<SparePartTransaction[]>(MOCK_SPARE_PART_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<SparePartCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "out" | "low" | "ok">("all");
  const [modal, setModal] = useState<{ part: SparePartExtended; mode: "issue" | "receive" } | null>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");

  const kpi = useMemo(() => {
    const total = parts.length;
    const out = parts.filter((p) => p.stock === 0).length;
    const low = parts.filter((p) => p.stock > 0 && p.stock < p.min_stock).length;
    const totalValue = parts.reduce((sum, p) => sum + p.stock * p.unit_price, 0);
    const needOrder = parts.filter((p) => p.stock < p.min_stock).length;
    return { total, out, low, totalValue, needOrder };
  }, [parts]);

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.part_id.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || p.category === catFilter;
      const s = getStockStatus(p);
      const matchStatus = statusFilter === "all" || s === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [parts, search, catFilter, statusFilter]);

  const handleConfirm = (qty: number, note: string, reqId: string) => {
    if (!modal) return;
    const { part, mode } = modal;
    const delta = mode === "issue" ? -qty : qty;
    setParts((prev) => prev.map((p) => p.part_id === part.part_id ? { ...p, stock: p.stock + delta, last_updated: new Date().toISOString() } : p));
    const tx: SparePartTransaction = {
      tx_id: `TX-${Date.now()}`,
      part_id: part.part_id,
      part_name: part.name,
      type: mode,
      quantity: qty,
      related_request_id: reqId || undefined,
      performed_by: "สมศักดิ์ ช่างไฟ",
      note: note || (mode === "issue" ? "เบิกใช้งาน" : "รับเข้าสต็อก"),
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    setModal(null);
  };

  const categories = Object.keys(SPARE_PART_CATEGORY_LABEL) as SparePartCategory[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 shadow-md" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)", color: "white" }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md grid place-items-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Spare Parts Management</div>
            <h1 className="font-bold truncate">ระบบบริหารจัดการอะไหล่</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {kpi.out > 0 && (
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.4)" }}>
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                หมดสต็อก {kpi.out}
              </span>
            )}
            {kpi.low > 0 && (
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)" }}>
                ⚠ ใกล้หมด {kpi.low}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate("/admin/dashboard")} aria-label="Dashboard">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate("/")} aria-label="ออกจากระบบ">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { label: "รายการทั้งหมด", value: kpi.total, icon: <Package className="h-4 w-4" />, accent: "#6366f1", border: "border-l-indigo-500" },
            { label: "ต้องสั่งซื้อ", value: kpi.needOrder, icon: <ShieldAlert className="h-4 w-4" />, accent: "#f59e0b", border: "border-l-amber-500" },
            { label: "หมดสต็อก", value: kpi.out, icon: <AlertTriangle className="h-4 w-4 text-red-500" />, accent: "#ef4444", border: "border-l-red-500" },
            { label: "ใกล้หมด", value: kpi.low, icon: <TrendingDown className="h-4 w-4 text-amber-500" />, accent: "#f59e0b", border: "border-l-amber-400" },
            { label: "มูลค่ารวม", value: `฿${formatPrice(kpi.totalValue)}`, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, accent: "#10b981", border: "border-l-emerald-500" },
          ].map((k) => (
            <Card key={k.label} className={cn("p-4 border-l-4 hover:shadow-md transition-shadow", k.border)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</p>
                  <p className="text-2xl font-bold tabular-nums leading-tight mt-0.5">{k.value}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center shrink-0">{k.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
          {[{ key: "stock", label: "รายการ Stock", icon: <Package className="h-4 w-4" /> }, { key: "history", label: "ประวัติการเคลื่อนไหว", icon: <History className="h-4 w-4" /> }].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as "stock" | "history")}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2",
                activeTab === t.key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {activeTab === "stock" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ค้นหาชื่อ หรือรหัสอะไหล่..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <button onClick={() => setCatFilter("all")} className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors", catFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>ทั้งหมด</button>
                {categories.map((c) => (
                  <button key={c} onClick={() => setCatFilter(c)} className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors", catFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                    {SPARE_PART_CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(["all", "ok", "low", "out"] as const).map((s) => {
                  const labels = { all: "ทุกสถานะ", ok: "🟢 ปกติ", low: "🟡 ใกล้หมด", out: "🔴 หมด" };
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors", statusFilter === s ? "bg-secondary text-secondary-foreground border-secondary" : "border-border hover:bg-muted")}>
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">รหัส / ชื่ออะไหล่</th>
                      <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">หมวดหมู่</th>
                      <th className="px-4 py-3 text-left font-medium">Stock / กราฟ</th>
                      <th className="px-4 py-3 text-left font-medium hidden md:table-cell">ตำแหน่ง</th>
                      <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">ราคา/หน่วย</th>
                      <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                      <th className="px-4 py-3 text-right font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">ไม่พบรายการอะไหล่</td></tr>
                    ) : (
                      filtered.map((p, i) => {
                        const s = getStockStatus(p);
                        const pct = stockPct(p);
                        const barColor = s === "out" ? "bg-red-400" : s === "low" ? "bg-amber-400" : "bg-emerald-400";
                        return (
                          <tr key={p.part_id} className={cn("border-b last:border-0 transition-colors hover:bg-muted/30", i % 2 !== 0 && "bg-muted/10")}>
                            <td className="px-4 py-3">
                              <p className="font-mono text-xs text-primary">{p.part_id}</p>
                              <p className="font-medium text-sm leading-tight mt-0.5">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.supplier}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{SPARE_PART_CATEGORY_LABEL[p.category]}</span>
                            </td>
                            <td className="px-4 py-3 min-w-[140px]">
                              <div className="flex items-baseline gap-1.5 mb-1.5">
                                <span className="font-bold text-base tabular-nums">{p.stock}</span>
                                <span className="text-xs text-muted-foreground">{p.unit}</span>
                                <span className="text-xs text-muted-foreground ml-auto">/ {p.max_stock}</span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                                <span>Min: {p.min_stock}</span>
                                <span>{pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{p.location}</td>
                            <td className="px-4 py-3 hidden lg:table-cell text-xs font-mono">฿{formatPrice(p.unit_price)}</td>
                            <td className="px-4 py-3"><StockBadge status={s} /></td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setModal({ part: p, mode: "issue" })}
                                  disabled={p.stock === 0}
                                  className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <ArrowUpFromLine className="h-3 w-3" /> เบิก
                                </button>
                                <button
                                  onClick={() => setModal({ part: p, mode: "receive" })}
                                  className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <ArrowDownToLine className="h-3 w-3" /> รับ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between">
                <span>แสดง {filtered.length} จาก {parts.length} รายการ</span>
                <span>อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH")}</span>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">ประวัติการเคลื่อนไหวอะไหล่</h3>
              </div>
              <span className="text-xs text-muted-foreground">{transactions.length} รายการ</span>
            </div>
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx.tx_id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-9 w-9 rounded-full grid place-items-center shrink-0 mt-0.5", tx.type === "issue" ? "bg-rose-100" : "bg-emerald-100")}>
                      {tx.type === "issue" ? <ArrowUpFromLine className="h-4 w-4 text-rose-600" /> : <ArrowDownToLine className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TxTypeBadge type={tx.type} />
                        <p className="font-medium text-sm">{tx.part_name}</p>
                        <span className="font-bold tabular-nums text-sm">×{tx.quantity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tx.note}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span>โดย {tx.performed_by}</span>
                        {tx.related_request_id && (
                          <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 font-mono">{tx.related_request_id}</span>
                        )}
                        <span className="ml-auto">{timeAgo(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {modal && (
        <IssueReceiveModal part={modal.part} mode={modal.mode} onClose={() => setModal(null)} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
