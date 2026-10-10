import { isValidDateStr } from "./dates";
import { MAX_AMOUNT, newId, round2 } from "./format";
import type { AppData, Category, Expense, ExpenseItem, SavedProduct } from "./types";

export const STORAGE_KEY = "daily-expenses-manager:v1";
const BACKUP_KEY = "daily-expenses-manager:corrupt-backup";

export const DEFAULT_CATEGORY_NAMES = ["Dairy", "Vegetables", "Fruits", "Drinks", "Grocery", "Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Other"];

export function defaultData(): AppData {
  return {
    version: 1,
    expenses: [],
    categories: DEFAULT_CATEGORY_NAMES.map((name) => ({ id: newId(), name, description: "" })),
    products: [],
    settings: { name: "Shivani" },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Turns anything (corrupt storage, an imported file, an older version) into valid
 * AppData. Bad records are dropped instead of crashing the app.
 */
export function sanitize(raw: unknown): AppData {
  const base = defaultData();
  if (!isObj(raw)) return base;

  const expenses: Expense[] = [];
  if (Array.isArray(raw.expenses)) {
    for (const e of raw.expenses) {
      if (!isObj(e) || !isValidDateStr(e.date) || !Array.isArray(e.items)) continue;
      const items: ExpenseItem[] = [];
      for (const i of e.items) {
        if (!isObj(i)) continue;
        const product = str(i.product, 120);
        const amount = typeof i.amount === "number" ? i.amount : Number(i.amount);
        if (!product || !Number.isFinite(amount) || amount < 0 || amount >= MAX_AMOUNT) continue;
        items.push({ id: str(i.id, 80) || newId(), product, category: str(i.category, 60), amount: round2(amount) });
      }
      if (!items.length) continue;
      expenses.push({
        id: str(e.id, 80) || newId(),
        date: e.date,
        items,
        createdAt: typeof e.createdAt === "number" && Number.isFinite(e.createdAt) ? e.createdAt : Date.now(),
      });
    }
  }

  let categories: Category[] = base.categories;
  if (Array.isArray(raw.categories)) {
    const seen = new Set<string>();
    categories = [];
    for (const c of raw.categories) {
      if (!isObj(c)) continue;
      const name = str(c.name, 40);
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      categories.push({ id: str(c.id, 80) || newId(), name, description: str(c.description, 200) });
    }
  }
  // Any category used by an expense must exist in the category list.
  const known = new Set(categories.map((c) => c.name.toLowerCase()));
  for (const e of expenses) {
    for (const i of e.items) {
      if (i.category && !known.has(i.category.toLowerCase())) {
        known.add(i.category.toLowerCase());
        categories.push({ id: newId(), name: i.category, description: "" });
      }
    }
  }

  const products: SavedProduct[] = [];
  const seenProducts = new Set<string>();
  const addProduct = (name: string, category: string, id?: string) => {
    const key = name.toLowerCase();
    if (!name || seenProducts.has(key)) return;
    seenProducts.add(key);
    products.push({ id: id || newId(), name, category });
  };
  if (Array.isArray(raw.products)) {
    for (const p of raw.products) {
      if (isObj(p)) addProduct(str(p.name, 120), str(p.category, 60), str(p.id, 80));
    }
  }
  // Only when there is no saved library at all (older or imported data) do we
  // build it from the expense history. Otherwise removed products stay removed.
  if (!Array.isArray(raw.products)) {
    for (const e of [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))) {
      for (const i of e.items) addProduct(i.product, i.category);
    }
  }

  const name = isObj(raw.settings) ? str(raw.settings.name, 40) : "";
  return { version: 1, expenses, categories, products, settings: { name: name || base.settings.name } };
}

export type LoadResult = { data: AppData; storageAvailable: boolean };

export function loadData(): LoadResult {
  let text: string | null = null;
  try {
    text = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { data: defaultData(), storageAvailable: false };
  }
  if (!text) return { data: defaultData(), storageAvailable: true };
  try {
    return { data: sanitize(JSON.parse(text)), storageAvailable: true };
  } catch {
    // Keep the unreadable text so nothing is silently destroyed.
    try {
      window.localStorage.setItem(BACKUP_KEY, text);
    } catch {
      /* ignore */
    }
    return { data: defaultData(), storageAvailable: true };
  }
}

export function saveData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
