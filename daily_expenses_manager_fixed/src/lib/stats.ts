import type { DateRange } from "./dates";
import { round2 } from "./format";
import type { Expense } from "./types";

export const UNCATEGORIZED = "Uncategorized";
export const PALETTE = ["#179b61", "#76b493", "#5a78db", "#8c69c7", "#e7a43c", "#7896a5", "#e57fa0"];
export const OTHERS_COLOR = "#d0d9d4";

export const expenseTotal = (e: Expense) => round2(e.items.reduce((s, i) => s + i.amount, 0));
export const inRange = (date: string, r: DateRange) => date >= r.start && date <= r.end;

export function sumInRange(expenses: Expense[], r: DateRange): number {
  let total = 0;
  for (const e of expenses) if (inRange(e.date, r)) total += expenseTotal(e);
  return round2(total);
}

export function totalsByDay(expenses: Expense[], days: string[]): number[] {
  const map = new Map<string, number>();
  for (const e of expenses) map.set(e.date, (map.get(e.date) ?? 0) + expenseTotal(e));
  return days.map((d) => round2(map.get(d) ?? 0));
}

export function totalsByMonth(expenses: Expense[], year: string): number[] {
  const out = new Array<number>(12).fill(0);
  for (const e of expenses) {
    if (e.date.slice(0, 4) !== year) continue;
    out[Number(e.date.slice(5, 7)) - 1] += expenseTotal(e);
  }
  return out.map(round2);
}

export type Slice = { name: string; amount: number; color: string };

/** Spending per category in a range, largest first, long tails folded into "Others". */
export function categorySlices(expenses: Expense[], r: DateRange, maxSlices = 6): Slice[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    if (!inRange(e.date, r)) continue;
    for (const i of e.items) {
      const key = i.category || UNCATEGORIZED;
      map.set(key, (map.get(key) ?? 0) + i.amount);
    }
  }
  const sorted = [...map.entries()].map(([name, amount]) => ({ name, amount: round2(amount) })).sort((a, b) => b.amount - a.amount);
  const head = sorted.slice(0, maxSlices).map((s, i) => ({ ...s, color: s.name === UNCATEGORIZED ? OTHERS_COLOR : PALETTE[i % PALETTE.length] }));
  const tail = sorted.slice(maxSlices);
  if (tail.length) head.push({ name: "Others", amount: round2(tail.reduce((s, x) => s + x.amount, 0)), color: OTHERS_COLOR });
  return head;
}

export type ProductStat = { name: string; amount: number; count: number; lastDate: string };

/** Per-product totals; products are matched ignoring case and surrounding spaces. */
export function productStats(expenses: Expense[], r?: DateRange): Map<string, ProductStat> {
  const map = new Map<string, ProductStat>();
  for (const e of expenses) {
    if (r && !inRange(e.date, r)) continue;
    for (const i of e.items) {
      const key = i.product.trim().toLowerCase();
      const cur = map.get(key);
      if (cur) {
        cur.amount = round2(cur.amount + i.amount);
        cur.count += 1;
        if (e.date > cur.lastDate) cur.lastDate = e.date;
      } else {
        map.set(key, { name: i.product, amount: round2(i.amount), count: 1, lastDate: e.date });
      }
    }
  }
  return map;
}

/** Percentage change, or null when there is nothing to compare against. */
export function percentChange(cur: number, prev: number): number | null {
  if (!(prev > 0)) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}
