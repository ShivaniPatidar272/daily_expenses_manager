export type ExpenseItem = { id: string; product: string; category: string; amount: number };
export type Expense = { id: string; date: string; items: ExpenseItem[]; createdAt: number };
export type Category = { id: string; name: string; description: string };
export type SavedProduct = { id: string; name: string; category: string };
export type Settings = { name: string };

export type AppData = {
  version: 1;
  expenses: Expense[];
  categories: Category[];
  products: SavedProduct[];
  settings: Settings;
};

export type Page = "dashboard" | "add" | "expenses" | "categories" | "products" | "reports" | "settings";
