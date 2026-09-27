export type Priority = "critical" | "high" | "medium" | "low";
export type Status = "open" | "assess" | "waiting" | "doing" | "done" | "qc1" | "qc2" | "complete";
export type WorkCategory =
  | "electrical-control"
  | "mechanical"
  | "pneumatic-hydraulic"
  | "lubrication-fluid"
  | "other"
  | "electrical"
  | "facility"
  | "plumbing"
  | "it";
export type SubStatus =
  | "reported"
  | "assessing"
  | "accepted"
  | "forwarded"
  | "in-progress"
  | "waiting-parts"
  | "closed"
  | "qc-round1"
  | "qc-round2"
  | "finished";
export type ActorRole = "technician" | "requester" | "system";

export interface RequestAttachment {
  attachment_id: string;
  name: string;
  url: string;
  mime_type?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface RequestDetails {
  asset_id: string;
  asset_type: string;
  machine_number: string;
  machine_zone: string;
  location_building: string;
  location_floor: string;
  location_line: string;
  access_required: boolean;
  access_time_window: string;
  issue_message: string;
  issue_symptom: "not-working" | "noise" | "vibration" | "error" | "other";
  issue_frequency: "first-time" | "repeated" | "always";
  machine_operability: "running" | "degraded" | "stopped";
  reporter_name: string;
  reporter_emp_id?: string;
  reporter_department: string;
  job_type: WorkCategory;
  reported_date_from_qr?: string;
  reported_time_from_qr?: string;
  additional_note?: string;
}

export interface AssessmentReport {
  visit_date: string;
  priority_level: Priority;
  work_status: Status;
  repair_date_range: { start: string; end: string };
  impact_while_waiting: "low" | "medium" | "high";
  machine_status_while_waiting: "running" | "degraded" | "stopped";
  result_text: string;
  temp_measure: string;
  communication_log: string;
  internal_note: string;
  assessment_attachments: RequestAttachment[];
}

export interface RequestNotification {
  notification_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface StatusTimelineEvent {
  event_id: string;
  status: Status;
  updated_by: string;
  updated_by_role: ActorRole;
  updated_at: string;
  note?: string;
}

export interface SparePart {
  part_id: string;
  name: string;
  stock: number;
  unit: string;
}

export interface WorkRequest {
  request_id: string;
  asset_name: string;
  asset_location: string;
  issue_summary: string;
  priority: Priority;
  status: Status;
  sub_status: SubStatus;
  reported_time: string;
  reported_by: string;
  reported_by_id?: string;
  reported_by_department?: string;
  category: WorkCategory;
  assigned_to?: string | null;
  attachments: RequestAttachment[];
  request_details?: RequestDetails;
  assessment_report?: AssessmentReport;
  status_timeline: StatusTimelineEvent[];
  requester_notifications: RequestNotification[];
}

export const MOCK_REQUESTS: WorkRequest[] = [
  {
    request_id: "REQ-20260422-002",
    asset_name: "ELC-DB-5510",
    asset_location: "ตู้ควบคุมไฟ อาคาร B ชั้น 2",
    issue_summary: "เบรกเกอร์ทริปบ่อย มีกลิ่นไหม้",
    priority: "critical",
    status: "open",
    sub_status: "reported",
    reported_time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    reported_by: "นภดล (ฝ่ายผลิต)",
    reported_by_id: "REQ042",
    reported_by_department: "ฝ่ายผลิต",
    category: "electrical",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260422-001",
    asset_name: "MCH-PR-2041",
    asset_location: "Hydraulic Press Line 3",
    issue_summary: "กระบอกสูบไฮดรอลิกมีน้ำมันรั่วซึม",
    priority: "high",
    status: "open",
    sub_status: "reported",
    reported_time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    reported_by: "ประยุทธ์ (Line Leader)",
    reported_by_id: "REQ021",
    reported_by_department: "Line Production",
    category: "mechanical",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260422-003",
    asset_name: "AC-OFF-019",
    asset_location: "แอร์ห้องประชุมใหญ่",
    issue_summary: "แอร์ไม่เย็น มีน้ำหยดจากเครื่อง",
    priority: "medium",
    status: "open",
    sub_status: "reported",
    reported_time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    reported_by: "วราภรณ์ (HR)",
    reported_by_id: "REQ099",
    reported_by_department: "HR",
    category: "facility",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260421-014",
    asset_name: "CNV-ASSY-08",
    asset_location: "สายพานลำเลียง Assembly 8",
    issue_summary: "เสียงดังผิดปกติบริเวณมอเตอร์",
    priority: "high",
    status: "doing",
    sub_status: "in-progress",
    reported_time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    reported_by: "สมชาย (Foreman)",
    reported_by_id: "REQ058",
    reported_by_department: "Production",
    category: "mechanical",
    assigned_to: "TECH001",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260421-009",
    asset_name: "PLB-WC-302",
    asset_location: "ห้องน้ำชาย ชั้น 3",
    issue_summary: "ก๊อกน้ำหยดตลอดเวลา",
    priority: "low",
    status: "open",
    sub_status: "reported",
    reported_time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    reported_by: "แม่บ้าน",
    reported_by_id: "REQ077",
    reported_by_department: "Housekeeping",
    category: "plumbing",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260421-022",
    asset_name: "MCH-CNC-12",
    asset_location: "CNC Machine #12",
    issue_summary: "รอชิ้นส่วนใบมีดทดแทน คาดว่าได้พรุ่งนี้",
    priority: "high",
    status: "waiting",
    sub_status: "waiting-parts",
    reported_time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    reported_by: "อนันต์",
    reported_by_id: "REQ080",
    reported_by_department: "Warehouse",
    category: "mechanical",
    assigned_to: "TECH001",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
  {
    request_id: "REQ-20260420-031",
    asset_name: "IT-SRV-RACK2",
    asset_location: "Server Room",
    issue_summary: "พัดลม UPS เสียงดัง",
    priority: "medium",
    status: "open",
    sub_status: "reported",
    reported_time: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    reported_by: "ทีม IT",
    reported_by_id: "REQ090",
    reported_by_department: "IT",
    category: "it",
    attachments: [],
    status_timeline: [],
    requester_notifications: [],
  },
];

const genEventId = () => `evt-${Math.random().toString(36).slice(2, 10)}`;

export const MOCK_REQUESTS_WITH_TIMELINE: WorkRequest[] = MOCK_REQUESTS.map((request) => {
  const timeline: StatusTimelineEvent[] = [
    {
      event_id: genEventId(),
      status: "open",
      updated_by: request.reported_by,
      updated_by_role: "requester",
      updated_at: request.reported_time,
      note: "เปิดงาน",
    },
  ];

  if (request.status !== "open") {
    timeline.push({
      event_id: genEventId(),
      status: request.status,
      updated_by: request.assigned_to ?? "TECH001",
      updated_by_role: "technician",
      updated_at: new Date(new Date(request.reported_time).getTime() + 1000 * 60 * 30).toISOString(),
      note:
        request.status === "waiting"
          ? "รออะไหล่"
          : request.status === "assess"
          ? "ประเมินงาน"
          : request.status === "qc1"
          ? "รอตรวจครั้งที่ 1"
          : request.status === "qc2"
          ? "รอตรวจครั้งที่ 2"
          : request.status === "complete"
          ? "เสร็จสิ้น"
          : "ช่างเริ่มงาน",
    });
  }

  return {
    ...request,
    status_timeline: timeline,
  };
});

export const MOCK_SPARE_PARTS: SparePart[] = [
  { part_id: "SP-HYD-004", name: "ซีลยางกันน้ำมัน 50mm", stock: 24, unit: "ชิ้น" },
  { part_id: "SP-ELC-112", name: "เบรกเกอร์ 3P 100A", stock: 6, unit: "ตัว" },
  { part_id: "SP-BRG-201", name: "ตลับลูกปืน 6204ZZ", stock: 18, unit: "ลูก" },
  { part_id: "SP-FIL-088", name: "ไส้กรองอากาศแอร์", stock: 12, unit: "ชุด" },
  { part_id: "SP-BLT-045", name: "สายพาน V-Belt A-42", stock: 9, unit: "เส้น" },
];

// ─── Spare Parts Extended ─────────────────────────────────────────────────────

export type SparePartCategory =
  | "hydraulic"
  | "electrical"
  | "bearing"
  | "belt"
  | "filter"
  | "pneumatic"
  | "lubricant"
  | "fastener"
  | "sensor"
  | "other";

export const SPARE_PART_CATEGORY_LABEL: Record<SparePartCategory, string> = {
  hydraulic: "ไฮดรอลิก",
  electrical: "ไฟฟ้า",
  bearing: "ตลับลูกปืน",
  belt: "สายพาน",
  filter: "ไส้กรอง",
  pneumatic: "ระบบลม",
  lubricant: "น้ำมัน/สารหล่อลื่น",
  fastener: "น็อต/สกรู",
  sensor: "เซ็นเซอร์",
  other: "อื่น ๆ",
};

export interface SparePartExtended {
  part_id: string;
  name: string;
  category: SparePartCategory;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  location: string;
  unit_price: number;
  supplier: string;
  last_updated: string;
  compatible_assets: string[];
}

export interface SparePartTransaction {
  tx_id: string;
  part_id: string;
  part_name: string;
  type: "issue" | "receive" | "adjust";
  quantity: number;
  related_request_id?: string;
  performed_by: string;
  note: string;
  timestamp: string;
}

const _now = Date.now();
const _d = (hoursBack: number) => new Date(_now - hoursBack * 3_600_000).toISOString();

export const MOCK_SPARE_PARTS_EXTENDED: SparePartExtended[] = [
  {
    part_id: "SP-HYD-004",
    name: "ซีลยางกันน้ำมัน 50mm",
    category: "hydraulic",
    stock: 24,
    min_stock: 10,
    max_stock: 50,
    unit: "ชิ้น",
    location: "ชั้น A-03",
    unit_price: 85,
    supplier: "Thai Seal Co., Ltd.",
    last_updated: _d(2),
    compatible_assets: ["MCH-PR-2041", "MCH-HYD-005"],
  },
  {
    part_id: "SP-ELC-112",
    name: "เบรกเกอร์ 3P 100A",
    category: "electrical",
    stock: 3,
    min_stock: 4,
    max_stock: 20,
    unit: "ตัว",
    location: "ชั้น B-01",
    unit_price: 1250,
    supplier: "Schneider Electric TH",
    last_updated: _d(5),
    compatible_assets: ["ELC-DB-5510", "ELC-DB-5520"],
  },
  {
    part_id: "SP-BRG-201",
    name: "ตลับลูกปืน 6204ZZ",
    category: "bearing",
    stock: 18,
    min_stock: 8,
    max_stock: 40,
    unit: "ลูก",
    location: "ชั้น A-05",
    unit_price: 320,
    supplier: "NSK Thailand",
    last_updated: _d(1),
    compatible_assets: ["CNV-ASSY-08", "MCH-MTR-110"],
  },
  {
    part_id: "SP-FIL-088",
    name: "ไส้กรองอากาศแอร์",
    category: "filter",
    stock: 12,
    min_stock: 6,
    max_stock: 30,
    unit: "ชุด",
    location: "ชั้น C-02",
    unit_price: 450,
    supplier: "Daikin Service TH",
    last_updated: _d(10),
    compatible_assets: ["AC-OFF-019", "AC-PROD-022"],
  },
  {
    part_id: "SP-BLT-045",
    name: "สายพาน V-Belt A-42",
    category: "belt",
    stock: 2,
    min_stock: 5,
    max_stock: 20,
    unit: "เส้น",
    location: "ชั้น A-04",
    unit_price: 780,
    supplier: "Gates Corporation TH",
    last_updated: _d(8),
    compatible_assets: ["CNV-ASSY-08", "MCH-PUMP-033"],
  },
  {
    part_id: "SP-PNM-017",
    name: "วาล์วลม 5/2 (สปริงกลับ)",
    category: "pneumatic",
    stock: 8,
    min_stock: 4,
    max_stock: 20,
    unit: "ตัว",
    location: "ชั้น B-03",
    unit_price: 1100,
    supplier: "SMC Thailand Co., Ltd.",
    last_updated: _d(3),
    compatible_assets: ["MCH-PR-2041", "ASSY-PNM-09"],
  },
  {
    part_id: "SP-LUB-055",
    name: "น้ำมันไฮดรอลิก ISO 46 (20L)",
    category: "lubricant",
    stock: 6,
    min_stock: 3,
    max_stock: 15,
    unit: "ถัง",
    location: "ชั้น D-01",
    unit_price: 2200,
    supplier: "PTT Lubricants",
    last_updated: _d(24),
    compatible_assets: ["MCH-PR-2041", "MCH-HYD-005", "MCH-CNC-12"],
  },
  {
    part_id: "SP-ELC-220",
    name: "คอนแทคเตอร์ 3P 40A",
    category: "electrical",
    stock: 0,
    min_stock: 3,
    max_stock: 12,
    unit: "ตัว",
    location: "ชั้น B-01",
    unit_price: 890,
    supplier: "Schneider Electric TH",
    last_updated: _d(48),
    compatible_assets: ["ELC-DB-5510", "CNV-ASSY-08"],
  },
  {
    part_id: "SP-SNS-099",
    name: "เซ็นเซอร์ Proximity Inductive 12mm",
    category: "sensor",
    stock: 5,
    min_stock: 3,
    max_stock: 15,
    unit: "ตัว",
    location: "ชั้น B-04",
    unit_price: 1650,
    supplier: "Omron Thailand",
    last_updated: _d(6),
    compatible_assets: ["MCH-CNC-12", "CNV-ASSY-08"],
  },
  {
    part_id: "SP-BRG-315",
    name: "ตลับลูกปืน 6306-2RS",
    category: "bearing",
    stock: 10,
    min_stock: 5,
    max_stock: 25,
    unit: "ลูก",
    location: "ชั้น A-05",
    unit_price: 580,
    supplier: "SKF Thailand",
    last_updated: _d(12),
    compatible_assets: ["MCH-PUMP-033", "MCH-MTR-110"],
  },
  {
    part_id: "SP-FST-011",
    name: "โบลต์ M12×50 สแตนเลส (แพ็ค 50)",
    category: "fastener",
    stock: 15,
    min_stock: 5,
    max_stock: 30,
    unit: "แพ็ค",
    location: "ชั้น C-05",
    unit_price: 280,
    supplier: "Thai Fastener Supply",
    last_updated: _d(72),
    compatible_assets: [],
  },
  {
    part_id: "SP-HYD-022",
    name: "ท่อไฮดรอลิก HP 3/8\" (1m)",
    category: "hydraulic",
    stock: 1,
    min_stock: 4,
    max_stock: 20,
    unit: "เมตร",
    location: "ชั้น A-03",
    unit_price: 950,
    supplier: "Parker Hannifin TH",
    last_updated: _d(4),
    compatible_assets: ["MCH-PR-2041", "MCH-HYD-005"],
  },
];

export const MOCK_SPARE_PART_TRANSACTIONS: SparePartTransaction[] = [
  {
    tx_id: "TX-20260922-001",
    part_id: "SP-HYD-004",
    part_name: "ซีลยางกันน้ำมัน 50mm",
    type: "issue",
    quantity: 4,
    related_request_id: "REQ-20260422-001",
    performed_by: "สมศักดิ์ ช่างไฟ",
    note: "เปลี่ยนซีลกระบอกสูบ Hydraulic Press Line 3",
    timestamp: _d(1.5),
  },
  {
    tx_id: "TX-20260922-002",
    part_id: "SP-ELC-112",
    part_name: "เบรกเกอร์ 3P 100A",
    type: "issue",
    quantity: 1,
    related_request_id: "REQ-20260422-002",
    performed_by: "สมศักดิ์ ช่างไฟ",
    note: "เปลี่ยนเบรกเกอร์ตู้ควบคุม ELC-DB-5510",
    timestamp: _d(0.5),
  },
  {
    tx_id: "TX-20260921-003",
    part_id: "SP-BRG-201",
    part_name: "ตลับลูกปืน 6204ZZ",
    type: "receive",
    quantity: 10,
    performed_by: "วิษณุ ช่างกล",
    note: "รับเข้าจาก PO-2026-0489",
    timestamp: _d(28),
  },
  {
    tx_id: "TX-20260921-004",
    part_id: "SP-BLT-045",
    part_name: "สายพาน V-Belt A-42",
    type: "issue",
    quantity: 3,
    related_request_id: "REQ-20260421-014",
    performed_by: "วิษณุ ช่างกล",
    note: "เปลี่ยนสายพานมอเตอร์ CNV-ASSY-08",
    timestamp: _d(5),
  },
  {
    tx_id: "TX-20260920-005",
    part_id: "SP-LUB-055",
    part_name: "น้ำมันไฮดรอลิก ISO 46 (20L)",
    type: "receive",
    quantity: 4,
    performed_by: "วิษณุ ช่างกล",
    note: "รับเข้าสต็อก",
    timestamp: _d(50),
  },
  {
    tx_id: "TX-20260920-006",
    part_id: "SP-ELC-220",
    part_name: "คอนแทคเตอร์ 3P 40A",
    type: "issue",
    quantity: 2,
    related_request_id: "REQ-20260421-014",
    performed_by: "สมศักดิ์ ช่างไฟ",
    note: "เปลี่ยนคอนแทคเตอร์มอเตอร์สายพานลำเลียง",
    timestamp: _d(52),
  },
  {
    tx_id: "TX-20260919-007",
    part_id: "SP-HYD-022",
    part_name: "ท่อไฮดรอลิก HP 3/8\" (1m)",
    type: "issue",
    quantity: 3,
    related_request_id: "REQ-20260422-001",
    performed_by: "วิษณุ ช่างกล",
    note: "เปลี่ยนท่อไฮดรอลิกที่รั่ว",
    timestamp: _d(75),
  },
  {
    tx_id: "TX-20260919-008",
    part_id: "SP-SNS-099",
    part_name: "เซ็นเซอร์ Proximity Inductive 12mm",
    type: "receive",
    quantity: 5,
    performed_by: "สมศักดิ์ ช่างไฟ",
    note: "รับเข้าจาก PO-2026-0495",
    timestamp: _d(80),
  },
];

// ─── Checksheet System ─────────────────────────────────────────────────────────

export type ChecksheetColumnType =
  | "checkbox"
  | "pass_fail"
  | "number"
  | "text"
  | "dropdown"
  | "rating";

export interface ChecksheetColumn {
  col_id: string;
  label: string;
  type: ChecksheetColumnType;
  options?: string[]; // for dropdown
  required: boolean;
  width?: "sm" | "md" | "lg";
}

export interface ChecksheetItem {
  item_id: string;
  order: number;
  topic: string;
  description?: string;
  group?: string;
}

export interface ChecksheetTemplate {
  template_id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "per_shift";
  machine_type?: string;
  items: ChecksheetItem[];
  columns: ChecksheetColumn[];
  created_by: string;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ChecksheetCellValue {
  item_id: string;
  col_id: string;
  value: string | boolean | number;
}

export interface ChecksheetRecord {
  record_id: string;
  template_id: string;
  template_name: string;
  completed_by: string;
  department: string;
  shift?: "A" | "B" | "C";
  machine_id?: string;
  values: ChecksheetCellValue[];
  note?: string;
  submitted_at: string;
  status: "complete" | "partial" | "flagged";
}

export const MOCK_CHECKSHEET_TEMPLATES: ChecksheetTemplate[] = [
  {
    template_id: "CS-TPL-001",
    name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
    description: "เช็คชีทตรวจสอบสภาพเครื่องจักรก่อนเริ่มกะผลิต",
    frequency: "daily",
    machine_type: "เครื่องจักรทั่วไป",
    created_by: "สมศักดิ์ ช่างไฟ",
    created_at: new Date(_now - 30 * 24 * 3600_000).toISOString(),
    updated_at: _d(48),
    active: true,
    columns: [
      { col_id: "c1", label: "ผล", type: "pass_fail", required: true, width: "sm" },
      { col_id: "c2", label: "ค่าที่วัดได้", type: "text", required: false, width: "md" },
      { col_id: "c3", label: "หมายเหตุ", type: "text", required: false, width: "lg" },
    ],
    items: [
      { item_id: "i1", order: 1, topic: "ระดับน้ำมันไฮดรอลิก", group: "ระบบไฮดรอลิก" },
      { item_id: "i2", order: 2, topic: "ตรวจรอยรั่วท่อไฮดรอลิก", group: "ระบบไฮดรอลิก" },
      { item_id: "i3", order: 3, topic: "แรงดันลม (ปกติ 6-7 bar)", group: "ระบบลม" },
      { item_id: "i4", order: 4, topic: "วาล์วลม — ไม่มีรอยรั่ว", group: "ระบบลม" },
      { item_id: "i5", order: 5, topic: "อุณหภูมิมอเตอร์ (<60°C)", group: "ระบบไฟฟ้า" },
      { item_id: "i6", order: 6, topic: "สัญญาณไฟ Alarm — ปกติ", group: "ระบบไฟฟ้า" },
      { item_id: "i7", order: 7, topic: "สายพาน — ไม่หย่อน/ไม่แตก", group: "กลไก" },
      { item_id: "i8", order: 8, topic: "เสียงผิดปกติ — ไม่พบ", group: "กลไก" },
      { item_id: "i9", order: 9, topic: "ทำความสะอาดรอบเครื่อง", group: "สุขลักษณะ" },
      { item_id: "i10", order: 10, topic: "ตรวจอุปกรณ์ Safety Guard", group: "ความปลอดภัย" },
    ],
  },
  {
    template_id: "CS-TPL-002",
    name: "PM รายสัปดาห์ — Hydraulic Press",
    description: "บำรุงรักษาเชิงป้องกันรายสัปดาห์สำหรับ Hydraulic Press",
    frequency: "weekly",
    machine_type: "Hydraulic Press",
    created_by: "วิษณุ ช่างกล",
    created_at: new Date(_now - 60 * 24 * 3600_000).toISOString(),
    updated_at: _d(72),
    active: true,
    columns: [
      { col_id: "c1", label: "สถานะ", type: "pass_fail", required: true, width: "sm" },
      { col_id: "c2", label: "ค่าที่วัด", type: "number", required: false, width: "sm" },
      { col_id: "c3", label: "หน่วย", type: "dropdown", options: ["bar", "°C", "mm", "A", "-"], required: false, width: "sm" },
      { col_id: "c4", label: "หมายเหตุ/Action", type: "text", required: false, width: "lg" },
    ],
    items: [
      { item_id: "i1", order: 1, topic: "ตรวจสอบแรงดันระบบ (ปกติ 180-200 bar)", group: "ระบบไฮดรอลิก" },
      { item_id: "i2", order: 2, topic: "เติมน้ำมันไฮดรอลิก (ถ้าต่ำกว่า Min)", group: "ระบบไฮดรอลิก" },
      { item_id: "i3", order: 3, topic: "ตรวจสอบซีลกระบอกสูบ", group: "ระบบไฮดรอลิก" },
      { item_id: "i4", order: 4, topic: "ทำความสะอาด Oil Filter", group: "ระบบไฮดรอลิก" },
      { item_id: "i5", order: 5, topic: "ตรวจ Proximity Sensor ตำแหน่ง", group: "ระบบไฟฟ้า" },
      { item_id: "i6", order: 6, topic: "วัดกระแสมอเตอร์ปั๊มไฮดรอลิก", group: "ระบบไฟฟ้า" },
      { item_id: "i7", order: 7, topic: "อัดจาระบีแกนลูกสูบ", group: "การหล่อลื่น" },
      { item_id: "i8", order: 8, topic: "ทดสอบการทำงานครบ 5 cycle", group: "ทดสอบการทำงาน" },
    ],
  },
  {
    template_id: "CS-TPL-003",
    name: "ตรวจสอบความปลอดภัยประจำเดือน",
    description: "เช็คชีทความปลอดภัยสำหรับผู้จัดการหรือหัวหน้างาน",
    frequency: "monthly",
    created_by: "ผู้จัดการฝ่ายซ่อมบำรุง",
    created_at: new Date(_now - 90 * 24 * 3600_000).toISOString(),
    updated_at: _d(168),
    active: true,
    columns: [
      { col_id: "c1", label: "ผ่าน/ไม่ผ่าน", type: "pass_fail", required: true, width: "sm" },
      { col_id: "c2", label: "คะแนน (1-5)", type: "rating", required: false, width: "sm" },
      { col_id: "c3", label: "ข้อสังเกต", type: "text", required: false, width: "lg" },
      { col_id: "c4", label: "ผู้รับผิดชอบ", type: "text", required: false, width: "md" },
    ],
    items: [
      { item_id: "i1", order: 1, topic: "ป้ายความปลอดภัยครบถ้วน", group: "อุปกรณ์ความปลอดภัย" },
      { item_id: "i2", order: 2, topic: "ถังดับเพลิงอยู่ในตำแหน่งและอยู่ในอายุการใช้งาน", group: "อุปกรณ์ความปลอดภัย" },
      { item_id: "i3", order: 3, topic: "Safety Guard ครบทุกเครื่อง", group: "อุปกรณ์ความปลอดภัย" },
      { item_id: "i4", order: 4, topic: "Emergency Stop ทำงานได้ปกติ", group: "ระบบ Emergency" },
      { item_id: "i5", order: 5, topic: "Lock-out / Tag-out อุปกรณ์ครบ", group: "ระบบ Emergency" },
      { item_id: "i6", order: 6, topic: "ทางหนีไฟไม่มีสิ่งกีดขวาง", group: "อาคาร/สถานที่" },
      { item_id: "i7", order: 7, topic: "แสงสว่างในพื้นที่เพียงพอ", group: "อาคาร/สถานที่" },
      { item_id: "i8", order: 8, topic: "พื้นไม่ลื่น / ไม่มีน้ำมันหก", group: "อาคาร/สถานที่" },
      { item_id: "i9", order: 9, topic: "พนักงานสวม PPE ครบ", group: "บุคลากร" },
      { item_id: "i10", order: 10, topic: "บันทึกการฝึกอบรมความปลอดภัยล่าสุด", group: "บุคลากร" },
    ],
  },
];

export const MOCK_CHECKSHEET_RECORDS: ChecksheetRecord[] = [
  {
    record_id: "REC-20260922-001",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
    completed_by: "สมศักดิ์ ช่างไฟ",
    department: "ฝ่ายซ่อมบำรุง",
    shift: "A",
    submitted_at: _d(4),
    status: "flagged",
    values: [
      { item_id: "i1", col_id: "c1", value: true },
      { item_id: "i2", col_id: "c1", value: false },
      { item_id: "i3", col_id: "c1", value: true },
      { item_id: "i3", col_id: "c2", value: "6.5" },
      { item_id: "i4", col_id: "c1", value: true },
      { item_id: "i5", col_id: "c1", value: false },
      { item_id: "i5", col_id: "c2", value: "72" },
      { item_id: "i5", col_id: "c3", value: "อุณหภูมิสูงกว่าปกติ ต้องติดตาม" },
      { item_id: "i6", col_id: "c1", value: true },
      { item_id: "i7", col_id: "c1", value: true },
      { item_id: "i8", col_id: "c1", value: true },
      { item_id: "i9", col_id: "c1", value: true },
      { item_id: "i10", col_id: "c1", value: true },
    ],
    note: "พบอุณหภูมิมอเตอร์สูง และรอยรั่วไฮดรอลิกเล็กน้อย แจ้งซ่อมแล้ว",
  },
  {
    record_id: "REC-20260921-002",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
    completed_by: "วิษณุ ช่างกล",
    department: "ฝ่ายซ่อมบำรุง",
    shift: "A",
    submitted_at: _d(28),
    status: "complete",
    values: [],
    note: "",
  },
  {
    record_id: "REC-20260920-003",
    template_id: "CS-TPL-002",
    template_name: "PM รายสัปดาห์ — Hydraulic Press",
    completed_by: "วิษณุ ช่างกล",
    department: "ฝ่ายซ่อมบำรุง",
    machine_id: "MCH-PR-2041",
    submitted_at: _d(48),
    status: "complete",
    values: [],
  },
  {
    record_id: "REC-20260915-004",
    template_id: "CS-TPL-003",
    template_name: "ตรวจสอบความปลอดภัยประจำเดือน",
    completed_by: "ผู้จัดการฝ่ายซ่อมบำรุง",
    department: "Management",
    submitted_at: _d(168),
    status: "complete",
    values: [],
  },
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "วิกฤติ",
  high: "สูง",
  medium: "ปานกลาง",
  low: "ต่ำ",
};

export const STATUS_LABEL: Record<Status, string> = {
  open: "เปิดงาน",
  assess: "ประเมินงาน",
  waiting: "รออะไหล่",
  doing: "กำลังซ่อม",
  done: "ปิดงาน",
  qc1: "รอตรวจครั้งที่ 1",
  qc2: "รอตรวจครั้งที่ 2",
  complete: "เสร็จสิ้น",
};

export const SUB_STATUS_LABEL: Record<SubStatus, string> = {
  reported: "แจ้งงานแล้ว",
  assessing: "กำลังประเมินงาน",
  accepted: "ช่างรับงานแล้ว",
  forwarded: "ส่งต่อ",
  "in-progress": "กำลังดำเนินการ",
  "waiting-parts": "รออะไหล่",
  closed: "ปิดงาน",
  "qc-round1": "รอตรวจครั้งที่ 1",
  "qc-round2": "รอตรวจครั้งที่ 2",
  finished: "เสร็จสิ้น",
};

export const CATEGORY_LABEL: Record<WorkCategory, string> = {
  "electrical-control": "ไฟฟ้า / ระบบควบคุม",
  electrical: "ไฟฟ้า",
  mechanical: "เครื่องกล",
  "pneumatic-hydraulic": "ระบบลม / ไฮดรอลิก",
  "lubrication-fluid": "ระบบหล่อลื่น / ของไหล",
  other: "อื่น ๆ",
  facility: "อาคาร/สิ่งอำนวย",
  plumbing: "ประปา",
  it: "ไอที",
};

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface Technician {
  technician_id: string;
  name: string;
  department: string;
}

export const TECHNICIAN_MAP: Record<string, Technician> = {
  TECH001: {
    technician_id: "TECH001",
    name: "สมศักดิ์ ช่างไฟ",
    department: "ฝ่ายซ่อมบำรุง",
  },
  TECH002: {
    technician_id: "TECH002",
    name: "วิษณุ ช่างกล",
    department: "ฝ่ายซ่อมบำรุง",
  },
  TECH003: {
    technician_id: "TECH003",
    name: "สุรพล ช่างประปา",
    department: "ฝ่ายซ่อมบำรุง",
  },
};

export function getTechnicianName(technicianId: string | null | undefined): string {
  if (!technicianId) return "-";
  return TECHNICIAN_MAP[technicianId]?.name || technicianId;
}

export function getTechnicianDepartment(technicianId: string | null | undefined): string {
  if (!technicianId) return "-";
  return TECHNICIAN_MAP[technicianId]?.department || "-";
}

// ─── Spare Part Request (ช่างขออะไหล่) ───────────────────────────────────────

export type SparePartRequestStatus = "pending" | "approved" | "rejected" | "ordered" | "received";

export interface SparePartRequest {
  sr_id: string;
  request_id: string;        // เชื่อมกับ WorkRequest
  asset_name: string;
  part_id: string;
  part_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  requested_by: string;      // technician_id
  requested_by_name: string;
  requested_at: string;
  status: SparePartRequestStatus;
  urgency: "normal" | "urgent" | "critical";
  reason: string;
  approved_by?: string;
  approved_at?: string;
  po_number?: string;
  reject_reason?: string;
}

export const MOCK_SPARE_PART_REQUESTS: SparePartRequest[] = [
  {
    sr_id: "SR-2026-001",
    request_id: "REQ-20260421-022",
    asset_name: "MCH-CNC-12",
    part_id: "SP-ELC-220",
    part_name: "คอนแทคเตอร์ 3P 40A",
    quantity: 2,
    unit: "ตัว",
    unit_price: 890,
    requested_by: "TECH001",
    requested_by_name: "สมศักดิ์ ช่างไฟ",
    requested_at: _d(10),
    status: "pending",
    urgency: "urgent",
    reason: "คอนแทคเตอร์ไหม้ ต้องเปลี่ยนเพื่อให้เครื่องกลับมาทำงานได้",
  },
  {
    sr_id: "SR-2026-002",
    request_id: "REQ-20260422-001",
    asset_name: "MCH-PR-2041",
    part_id: "SP-HYD-022",
    part_name: "ท่อไฮดรอลิก HP 3/8\" (1m)",
    quantity: 3,
    unit: "เมตร",
    unit_price: 950,
    requested_by: "TECH002",
    requested_by_name: "วิษณุ ช่างกล",
    requested_at: _d(8),
    status: "approved",
    urgency: "urgent",
    reason: "ท่อรั่วซึม กระทบการผลิต Line 3",
    approved_by: "ADMIN001",
    approved_at: _d(6),
    po_number: "PO-2026-0512",
  },
  {
    sr_id: "SR-2026-003",
    request_id: "REQ-20260421-014",
    asset_name: "CNV-ASSY-08",
    part_id: "SP-BLT-045",
    part_name: "สายพาน V-Belt A-42",
    quantity: 5,
    unit: "เส้น",
    unit_price: 780,
    requested_by: "TECH002",
    requested_by_name: "วิษณุ ช่างกล",
    requested_at: _d(30),
    status: "received",
    urgency: "normal",
    reason: "สายพานเก่าเริ่มหย่อน ควรเปลี่ยนก่อนขาด",
    approved_by: "ADMIN001",
    approved_at: _d(28),
    po_number: "PO-2026-0489",
  },
  {
    sr_id: "SR-2026-004",
    request_id: "REQ-20260422-002",
    asset_name: "ELC-DB-5510",
    part_id: "SP-ELC-112",
    part_name: "เบรกเกอร์ 3P 100A",
    quantity: 2,
    unit: "ตัว",
    unit_price: 1250,
    requested_by: "TECH001",
    requested_by_name: "สมศักดิ์ ช่างไฟ",
    requested_at: _d(2),
    status: "pending",
    urgency: "critical",
    reason: "เบรกเกอร์ทริปบ่อย มีกลิ่นไหม้ ต้องเปลี่ยนทันที",
  },
  {
    sr_id: "SR-2026-005",
    request_id: "REQ-20260421-014",
    asset_name: "CNV-ASSY-08",
    part_id: "SP-SNS-099",
    part_name: "เซ็นเซอร์ Proximity Inductive 12mm",
    quantity: 1,
    unit: "ตัว",
    unit_price: 1650,
    requested_by: "TECH001",
    requested_by_name: "สมศักดิ์ ช่างไฟ",
    requested_at: _d(5),
    status: "ordered",
    urgency: "normal",
    reason: "เซ็นเซอร์ตรวจจับตำแหน่งเสีย ส่งผลให้สายพานหยุดทำงาน",
    approved_by: "ADMIN001",
    approved_at: _d(4),
    po_number: "PO-2026-0510",
  },
];

// ─── Purchase Order ────────────────────────────────────────────────────────────

export type POStatus = "pending" | "approved" | "rejected" | "ordered";

export interface PurchaseOrder {
  po_id: string;
  sr_ids: string[];
  items: { part_name: string; quantity: number; unit: string; unit_price: number }[];
  total_amount: number;
  requested_by: string;
  requested_by_name: string;
  requested_at: string;
  status: POStatus;
  approved_by?: string;
  approved_at?: string;
  reject_reason?: string;
  supplier?: string;
  note?: string;
}

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    po_id: "PO-2026-0515",
    sr_ids: ["SR-2026-001", "SR-2026-004"],
    items: [
      { part_name: "คอนแทคเตอร์ 3P 40A", quantity: 2, unit: "ตัว", unit_price: 890 },
      { part_name: "เบรกเกอร์ 3P 100A", quantity: 2, unit: "ตัว", unit_price: 1250 },
    ],
    total_amount: 4280,
    requested_by: "ADMIN001",
    requested_by_name: "ผู้จัดการฝ่ายซ่อมบำรุง",
    requested_at: _d(1),
    status: "pending",
    supplier: "Schneider Electric TH",
    note: "งานวิกฤติ ต้องการเร่งด่วน",
  },
  {
    po_id: "PO-2026-0512",
    sr_ids: ["SR-2026-002"],
    items: [
      { part_name: "ท่อไฮดรอลิก HP 3/8\" (1m)", quantity: 3, unit: "เมตร", unit_price: 950 },
    ],
    total_amount: 2850,
    requested_by: "ADMIN001",
    requested_by_name: "ผู้จัดการฝ่ายซ่อมบำรุง",
    requested_at: _d(6),
    status: "approved",
    approved_by: "EXEC001",
    approved_at: _d(5),
    supplier: "Parker Hannifin TH",
  },
  {
    po_id: "PO-2026-0489",
    sr_ids: ["SR-2026-003"],
    items: [
      { part_name: "สายพาน V-Belt A-42", quantity: 5, unit: "เส้น", unit_price: 780 },
    ],
    total_amount: 3900,
    requested_by: "ADMIN001",
    requested_by_name: "ผู้จัดการฝ่ายซ่อมบำรุง",
    requested_at: _d(29),
    status: "ordered",
    approved_by: "EXEC001",
    approved_at: _d(28),
    supplier: "Gates Corporation TH",
  },
];

// ─── QC Schedule ──────────────────────────────────────────────────────────────

export type QCScheduleStatus = "scheduled" | "in-progress" | "done" | "missed";

export interface QCSchedule {
  schedule_id: string;
  title: string;
  frequency: "daily" | "monthly";
  machine_name: string;
  machine_id: string;
  zone: string;
  assigned_to: string;
  assigned_to_name: string;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  checked_in_at?: string;
  checked_out_at?: string;
  status: QCScheduleStatus;
  template_id?: string;
  template_name?: string;
  record_id?: string;
  findings?: string;
  work_request_id?: string;
}

export const QC_OFFICER_MAP: Record<string, { id: string; name: string }> = {
  QC001: { id: "QC001", name: "ณัฐพงศ์ QC" },
  QC002: { id: "QC002", name: "สุภาพร QC" },
};

const _today = new Date();
const _dateStr = (daysOffset: number) => {
  const d = new Date(_today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
};

export const MOCK_QC_SCHEDULES: QCSchedule[] = [
  {
    schedule_id: "QCS-2026-001",
    title: "ตรวจ QC เครื่องจักรประจำวัน — Line A",
    frequency: "daily",
    machine_name: "MCH-PR-2041 (Hydraulic Press)",
    machine_id: "MCH-PR-2041",
    zone: "Line A — อาคารผลิต",
    assigned_to: "QC001",
    assigned_to_name: "ณัฐพงศ์ QC",
    scheduled_date: _dateStr(0),
    scheduled_time_start: "08:00",
    scheduled_time_end: "09:00",
    checked_in_at: new Date(_today.getFullYear(), _today.getMonth(), _today.getDate(), 8, 5).toISOString(),
    checked_out_at: new Date(_today.getFullYear(), _today.getMonth(), _today.getDate(), 8, 52).toISOString(),
    status: "done",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
    record_id: "REC-20260922-001",
    findings: "พบน้ำมันรั่วเล็กน้อย แจ้งช่างแล้ว",
    work_request_id: "REQ-20260422-001",
  },
  {
    schedule_id: "QCS-2026-002",
    title: "ตรวจ QC สายพานลำเลียง Assembly",
    frequency: "daily",
    machine_name: "CNV-ASSY-08",
    machine_id: "CNV-ASSY-08",
    zone: "Zone Assembly",
    assigned_to: "QC002",
    assigned_to_name: "สุภาพร QC",
    scheduled_date: _dateStr(0),
    scheduled_time_start: "10:00",
    scheduled_time_end: "11:00",
    status: "scheduled",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
  },
  {
    schedule_id: "QCS-2026-003",
    title: "PM รายสัปดาห์ — Hydraulic System",
    frequency: "daily",
    machine_name: "MCH-HYD-005",
    machine_id: "MCH-HYD-005",
    zone: "Line B",
    assigned_to: "QC001",
    assigned_to_name: "ณัฐพงศ์ QC",
    scheduled_date: _dateStr(1),
    scheduled_time_start: "13:00",
    scheduled_time_end: "15:00",
    status: "scheduled",
    template_id: "CS-TPL-002",
    template_name: "PM รายสัปดาห์ — Hydraulic Press",
  },
  {
    schedule_id: "QCS-2026-004",
    title: "ตรวจ QC ตู้ไฟฟ้า",
    frequency: "daily",
    machine_name: "ELC-DB-5510",
    machine_id: "ELC-DB-5510",
    zone: "อาคาร B ชั้น 2",
    assigned_to: "QC002",
    assigned_to_name: "สุภาพร QC",
    scheduled_date: _dateStr(-1),
    scheduled_time_start: "14:00",
    scheduled_time_end: "15:00",
    status: "missed",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
  },
  {
    schedule_id: "QCS-2026-005",
    title: "ตรวจสอบความปลอดภัยประจำเดือน",
    frequency: "monthly",
    machine_name: "ทุกพื้นที่",
    machine_id: "ALL",
    zone: "ทั้งโรงงาน",
    assigned_to: "QC001",
    assigned_to_name: "ณัฐพงศ์ QC",
    scheduled_date: _dateStr(5),
    scheduled_time_start: "09:00",
    scheduled_time_end: "12:00",
    status: "scheduled",
    template_id: "CS-TPL-003",
    template_name: "ตรวจสอบความปลอดภัยประจำเดือน",
  },
  {
    schedule_id: "QCS-2026-006",
    title: "ตรวจ QC เครื่อง CNC",
    frequency: "daily",
    machine_name: "MCH-CNC-12",
    machine_id: "MCH-CNC-12",
    zone: "CNC Area",
    assigned_to: "QC002",
    assigned_to_name: "สุภาพร QC",
    scheduled_date: _dateStr(-2),
    scheduled_time_start: "08:00",
    scheduled_time_end: "09:00",
    checked_in_at: new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() - 2, 8, 10).toISOString(),
    checked_out_at: new Date(_today.getFullYear(), _today.getMonth(), _today.getDate() - 2, 9, 0).toISOString(),
    status: "done",
    template_id: "CS-TPL-001",
    template_name: "ตรวจสอบเครื่องจักรประจำวัน (เช้า)",
    record_id: "REC-20260921-002",
  },
];

// ─── User Approval Request ────────────────────────────────────────────────────

export type UserRole = "technician" | "qc" | "admin" | "executive" | "requester";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface UserApprovalRequest {
  approval_id: string;
  name: string;
  emp_id: string;
  department: string;
  position: string;
  role_requested: UserRole;
  requested_at: string;
  status: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  reject_reason?: string;
  note?: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  technician: "ช่างซ่อมบำรุง",
  qc: "เจ้าหน้าที่ QC",
  admin: "ผู้ดูแลระบบ",
  executive: "ผู้บริหาร",
  requester: "ผู้แจ้งซ่อม",
};

export const MOCK_USER_APPROVAL_REQUESTS: UserApprovalRequest[] = [
  {
    approval_id: "APV-2026-001",
    name: "ชาญณรงค์ มั่นคง",
    emp_id: "EMP-1045",
    department: "ฝ่ายซ่อมบำรุง",
    position: "ช่างไฟฟ้า",
    role_requested: "technician",
    requested_at: _d(2),
    status: "pending",
    note: "โอนย้ายมาจากสาขาอยุธยา",
  },
  {
    approval_id: "APV-2026-002",
    name: "พิมพ์ชนก เจริญสุข",
    emp_id: "EMP-1052",
    department: "ฝ่ายควบคุมคุณภาพ",
    position: "วิศวกร QC",
    role_requested: "qc",
    requested_at: _d(5),
    status: "approved",
    approved_by: "ผู้บริหาร",
    approved_at: _d(4),
  },
  {
    approval_id: "APV-2026-003",
    name: "ธนกฤต วิทยากร",
    emp_id: "EMP-0892",
    department: "ฝ่ายซ่อมบำรุง",
    position: "หัวหน้าช่าง",
    role_requested: "admin",
    requested_at: _d(7),
    status: "pending",
    note: "ขอสิทธิ์ Admin เพิ่มเพื่อจัดการตาราง PM",
  },
  {
    approval_id: "APV-2026-004",
    name: "วรรณิศา ทองดี",
    emp_id: "EMP-1100",
    department: "ฝ่ายผลิต",
    position: "พนักงานผลิต",
    role_requested: "requester",
    requested_at: _d(1),
    status: "approved",
    approved_by: "ผู้บริหาร",
    approved_at: _d(0.5),
  },
  {
    approval_id: "APV-2026-005",
    name: "อภิวัฒน์ สมหวัง",
    emp_id: "EMP-0750",
    department: "ฝ่ายซ่อมบำรุง",
    position: "ช่างกล",
    role_requested: "technician",
    requested_at: _d(14),
    status: "rejected",
    reject_reason: "ยังไม่ผ่านการอบรมภายใน",
  },
];
