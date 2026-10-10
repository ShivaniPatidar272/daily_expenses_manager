const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Indian-rupee formatting with lakh/crore grouping, e.g. ₹2,85,420. */
export function formatINR(n: number): string {
  const v = round2(Number.isFinite(n) ? n : 0);
  const abs = Math.abs(v);
  const body = Number.isInteger(abs) ? inr0.format(abs) : inr2.format(abs);
  return `${v < 0 ? "-" : ""}₹${body}`;
}

/** Short labels for chart axes: ₹500, ₹1.5k, ₹2L. */
export function formatCompactINR(n: number): string {
  const v = Math.abs(n);
  const trim = (x: number) => String(Math.round(x * 10) / 10);
  if (v >= 10000000) return `₹${trim(v / 10000000)}Cr`;
  if (v >= 100000) return `₹${trim(v / 100000)}L`;
  if (v >= 1000) return `₹${trim(v / 1000)}k`;
  return `₹${trim(v)}`;
}

export const MAX_AMOUNT = 1_000_000_000;

export type AmountResult = { ok: true; value: number } | { ok: false; error: string };

/** Validates a typed amount. Up to 2 decimals, greater than zero. */
export function parseAmount(input: string): AmountResult {
  const t = input.trim().replace(/,/g, "");
  if (t === "") return { ok: false, error: "Enter an amount" };
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return { ok: false, error: "Use a positive number with up to 2 decimals" };
  const value = Number(t);
  if (!(value > 0)) return { ok: false, error: "Amount must be greater than 0" };
  if (value >= MAX_AMOUNT) return { ok: false, error: "Amount is too large" };
  return { ok: true, value: round2(value) };
}

export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
