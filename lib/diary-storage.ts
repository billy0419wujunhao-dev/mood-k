export const DIARY_STORAGE_KEY = "emotion-k-line-diary:records";

export type DiaryRecord = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  title: string;
  summary: string;
  content: string;
  tags: string;
};

export function getLocalDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clampInt1to10(n: unknown, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function parseRecordEntry(dateKey: string, val: unknown): DiaryRecord | null {
  if (!val || typeof val !== "object") return null;
  const o = val as Partial<DiaryRecord> & {
    oneLiner?: unknown;
    tagsList?: unknown;
  };
  const summaryVal =
    typeof o.summary === "string"
      ? o.summary
      : typeof o.oneLiner === "string"
        ? o.oneLiner
        : "";
  const tagsVal =
    typeof o.tags === "string"
      ? o.tags
      : Array.isArray(o.tagsList)
        ? o.tagsList.filter((t): t is string => typeof t === "string").join(", ")
        : "";
  return {
    date: typeof o.date === "string" ? o.date : dateKey,
    open: clampInt1to10(o.open, 5),
    high: clampInt1to10(o.high, 7),
    low: clampInt1to10(o.low, 4),
    close: clampInt1to10(o.close, 6),
    title: typeof o.title === "string" ? o.title : "",
    summary: summaryVal,
    content: typeof o.content === "string" ? o.content : "",
    tags: tagsVal,
  };
}

function canAccessLocalStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return typeof localStorage !== "undefined" && localStorage !== null;
  } catch {
    return false;
  }
}

export function loadAllRecords(): Record<string, DiaryRecord> {
  if (!canAccessLocalStorage()) return {};
  try {
    const raw = localStorage.getItem(DIARY_STORAGE_KEY);
    if (raw == null || raw === "") return {};
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, DiaryRecord> = {};
    for (const [key, val] of Object.entries(parsed)) {
      const rec = parseRecordEntry(key, val);
      if (rec) out[rec.date] = rec;
    }
    return out;
  } catch {
    return {};
  }
}

export function loadTodayRecord(): DiaryRecord | null {
  const key = getLocalDateKey();
  const all = loadAllRecords();
  return all[key] ?? null;
}

export function upsertTodayRecord(record: DiaryRecord): void {
  if (!canAccessLocalStorage()) return;
  try {
    const all = loadAllRecords();
    all[record.date] = record;
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode / security policy */
  }
}
