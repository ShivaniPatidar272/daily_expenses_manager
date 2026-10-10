import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { newId } from "./lib/format";
import { STORAGE_KEY, clearStoredData, defaultData, loadData, sanitize, saveData } from "./lib/storage";
import type { AppData, Category, Expense, SavedProduct } from "./lib/types";

type Action =
  | { type: "saveExpense"; expense: Expense }
  | { type: "deleteExpense"; id: string }
  | { type: "saveCategory"; category: Category }
  | { type: "deleteCategory"; id: string }
  | { type: "saveProduct"; product: SavedProduct }
  | { type: "deleteProduct"; id: string }
  | { type: "setName"; name: string }
  | { type: "replaceAll"; data: AppData }
  | { type: "reset" };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "saveExpense": {
      const exists = state.expenses.some((e) => e.id === action.expense.id);
      const expenses = exists ? state.expenses.map((e) => (e.id === action.expense.id ? action.expense : e)) : [...state.expenses, action.expense];
      // Every product used becomes available for autocomplete.
      const products = [...state.products];
      for (const item of action.expense.items) {
        const idx = products.findIndex((p) => same(p.name, item.product));
        if (idx === -1) products.push({ id: newId(), name: item.product, category: item.category });
        else if (!products[idx].category && item.category) products[idx] = { ...products[idx], category: item.category };
      }
      return { ...state, expenses, products };
    }
    case "deleteExpense":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case "saveCategory": {
      const old = state.categories.find((c) => c.id === action.category.id);
      const categories = old ? state.categories.map((c) => (c.id === old.id ? action.category : c)) : [...state.categories, action.category];
      if (!old || old.name === action.category.name) return { ...state, categories };
      // Renaming keeps every expense and product linked to the category.
      const rename = (c: string) => (same(c, old.name) ? action.category.name : c);
      return {
        ...state,
        categories,
        expenses: state.expenses.map((e) => ({ ...e, items: e.items.map((i) => ({ ...i, category: rename(i.category) })) })),
        products: state.products.map((p) => ({ ...p, category: rename(p.category) })),
      };
    }
    case "deleteCategory": {
      const old = state.categories.find((c) => c.id === action.id);
      if (!old) return state;
      const clear = (c: string) => (same(c, old.name) ? "" : c);
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== old.id),
        expenses: state.expenses.map((e) => ({ ...e, items: e.items.map((i) => ({ ...i, category: clear(i.category) })) })),
        products: state.products.map((p) => ({ ...p, category: clear(p.category) })),
      };
    }
    case "saveProduct": {
      const old = state.products.find((p) => p.id === action.product.id);
      const products = old ? state.products.map((p) => (p.id === old.id ? action.product : p)) : [...state.products, action.product];
      if (!old || old.name === action.product.name) return { ...state, products };
      // Renaming a product updates it everywhere it appears in the history.
      return {
        ...state,
        products,
        expenses: state.expenses.map((e) => ({ ...e, items: e.items.map((i) => (same(i.product, old.name) ? { ...i, product: action.product.name } : i)) })),
      };
    }
    case "deleteProduct":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "setName":
      return { ...state, settings: { ...state.settings, name: action.name } };
    case "replaceAll":
      return action.data;
    case "reset":
      return defaultData();
  }
}

type Store = {
  data: AppData;
  dispatch: (a: Action) => void;
  storageOk: boolean;
  toast: string | null;
  notify: (message: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadData);
  const [data, rawDispatch] = useReducer(reducer, initial.data);
  const [storageOk, setStorageOk] = useState(initial.storageAvailable);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const skipNextSave = useRef(true);

  // Save after every change (the first render only mirrors what was just loaded).
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setStorageOk(saveData(data));
  }, [data]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      skipNextSave.current = true;
      try {
        rawDispatch({ type: "replaceAll", data: e.newValue ? sanitize(JSON.parse(e.newValue)) : defaultData() });
      } catch {
        skipNextSave.current = false;
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const dispatch = useCallback((a: Action) => {
    if (a.type === "reset") clearStoredData();
    rawDispatch(a);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo(() => ({ data, dispatch, storageOk, toast, notify }), [data, dispatch, storageOk, toast, notify]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
