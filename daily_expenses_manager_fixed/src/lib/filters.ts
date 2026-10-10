import type { DateRange } from "./dates";
import { formatDate } from "./dates";
import { expenseTotal, inRange } from "./stats";
import type { Expense } from "./types";

export type Filters = { from: string; to: string; category: string; product: string; min: string; max: string };
export const emptyFilters: Filters = { from: "", to: "", category: "", product: "", min: "", max: "" };

const num = (s: string): number | null => {
  const t = s.trim().replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

export function hasActiveFilters(f: Filters): boolean {
  return Object.values(f).some((v) => v.trim() !== "");
}

export function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}

/** Applies the quick range, the filter panel and the free-text search together. */
export function filterExpenses(expenses: Expense[], quick: DateRange | null, f: Filters, query: string): Expense[] {
  const min = num(f.min);
  const max = num(f.max);
  const product = f.product.trim().toLowerCase();
  const q = query.trim().toLowerCase();
  return expenses.filter((e) => {
    if (quick && !inRange(e.date, quick)) return false;
    if (f.from && e.date < f.from) return false;
    if (f.to && e.date > f.to) return false;
    if (f.category && !e.items.some((i) => (f.category === "__none__" ? !i.category : i.category.toLowerCase() === f.category.toLowerCase()))) return false;
    if (product && !e.items.some((i) => i.product.toLowerCase().includes(product))) return false;
    const total = expenseTotal(e);
    if (min !== null && total < min) return false;
    if (max !== null && total > max) return false;
    if (q) {
      const hay = `${e.date} ${formatDate(e.date)} ${e.items.map((i) => `${i.product} ${i.category}`).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const csvCell = (v: string | number): string => {
  let s = String(v);
  // Stop spreadsheet apps from treating text as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function expensesToCsv(expenses: Expense[]): string {
  const rows = [["Date", "Product", "Category", "Amount (INR)"]];
  for (const e of expenses) for (const i of e.items) rows.push([e.date, i.product, i.category, String(i.amount)]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
