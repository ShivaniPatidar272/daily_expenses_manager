// All dates are plain "YYYY-MM-DD" strings in the user's local time zone.
// Strings in this format sort and compare correctly with < and >.

const pad = (n: number) => String(n).padStart(2, "0");

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type DateRange = { start: string; end: string };

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return toDateStr(new Date());
}

/** Parses at local noon so daylight-saving shifts can never move the day. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function isValidDateStr(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const year = Number(s.slice(0, 4));
  if (year < 1900 || year > 2100) return false;
  return toDateStr(parseDate(s)) === s;
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** Monday-based week start. */
export function startOfWeek(s: string): string {
  const dow = (parseDate(s).getDay() + 6) % 7;
  return addDays(s, -dow);
}

export const startOfMonth = (s: string) => `${s.slice(0, 7)}-01`;
export const startOfYear = (s: string) => `${s.slice(0, 4)}-01-01`;
export const endOfYear = (s: string) => `${s.slice(0, 4)}-12-31`;

export function endOfMonth(s: string): string {
  const d = parseDate(s);
  return toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
}

export function addMonths(s: string, n: number): string {
  const d = parseDate(startOfMonth(s));
  d.setMonth(d.getMonth() + n);
  return toDateStr(d);
}

/** Number of days in [a, b], inclusive. */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000) + 1;
}

export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  const n = daysBetween(start, end);
  for (let i = 0; i < n && i < 3700; i++) out.push(addDays(start, i));
  return out;
}

export function formatDate(s: string): string {
  if (!isValidDateStr(s)) return s;
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function weekdayName(s: string): string {
  return WEEKDAYS_LONG[parseDate(s).getDay()];
}

export function formatDateLong(s: string): string {
  const d = parseDate(s);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateMedium(s: string): string {
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeDay(s: string, t: string): string {
  const diff = daysBetween(s, t) - 1;
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return formatDate(s);
}

export type RangeKind = "Today" | "This Week" | "This Month" | "This Year" | "Custom";

export function rangeFor(kind: RangeKind, t: string, custom: DateRange): DateRange {
  switch (kind) {
    case "Today":
      return { start: t, end: t };
    case "This Week":
      return { start: startOfWeek(t), end: addDays(startOfWeek(t), 6) };
    case "This Month":
      return { start: startOfMonth(t), end: endOfMonth(t) };
    case "This Year":
      return { start: startOfYear(t), end: endOfYear(t) };
    case "Custom":
      return custom.start <= custom.end ? custom : { start: custom.end, end: custom.start };
  }
}

/**
 * The comparable "previous" window for a period, covering the same number of
 * elapsed days (so "this month so far" is compared with "last month, same days").
 */
export function previousRange(kind: RangeKind, current: DateRange, t: string): DateRange | null {
  switch (kind) {
    case "Today":
      return { start: addDays(t, -1), end: addDays(t, -1) };
    case "This Week":
      return { start: addDays(current.start, -7), end: addDays(t, -7) };
    case "This Month": {
      const prevStart = addMonths(current.start, -1);
      const elapsed = daysBetween(current.start, t) - 1;
      const end = addDays(prevStart, elapsed);
      const prevMonthEnd = endOfMonth(prevStart);
      return { start: prevStart, end: end < prevMonthEnd ? end : prevMonthEnd };
    }
    case "This Year":
      return null;
    case "Custom": {
      const len = daysBetween(current.start, current.end);
      return { start: addDays(current.start, -len), end: addDays(current.start, -1) };
    }
  }
}

/** Human-readable description of a period, e.g. "September 2026". */
export function periodLabel(kind: RangeKind, r: DateRange): string {
  switch (kind) {
    case "Today": return formatDate(r.start);
    case "This Month": return `${MONTHS_LONG[parseDate(r.start).getMonth()]} ${r.start.slice(0, 4)}`;
    case "This Year": return r.start.slice(0, 4);
    default: return `${formatDate(r.start)} – ${formatDate(r.end)}`;
  }
}
