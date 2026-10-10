import { useState } from "react";
import { Button, Icon, TextInput, type IconName } from "./components/ui";
import AddExpense from "./pages/AddExpense";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import ExpenseDetail from "./pages/ExpenseDetail";
import Expenses from "./pages/Expenses";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import { StoreProvider, useStore } from "./store";
import type { Page } from "./lib/types";

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "add", label: "Add Expense", icon: "plus" },
  { id: "expenses", label: "Expenses", icon: "receipt" },
  { id: "categories", label: "Categories", icon: "tag" },
  { id: "products", label: "Products", icon: "box" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const titles: Record<Page, string> = { dashboard: "Dashboard", add: "Add Expense", expenses: "All Expenses", categories: "Categories", products: "Products", reports: "Reports & Analytics", settings: "Settings" };

function Sidebar({ page, setPage, open, close }: { page: Page; setPage: (p: Page) => void; open: boolean; close: () => void }) {
  const { data } = useStore();
  return <>
    {open && <div className="scrim mobile-only" onClick={close}/>}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="logo"><Icon name="logo" size={21}/></span><span>Daily Expense<br/>Manager</span></div>
      <nav className="nav-list">
        {navItems.map((item) => <button key={item.id} type="button" className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); close(); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}
      </nav>
      <button type="button" className="profile" onClick={() => { setPage("settings"); close(); }} aria-label="Open settings">
        <span className="avatar">{(data.settings.name[0] ?? "?").toUpperCase()}</span>
        <span className="profile-copy"><strong>{data.settings.name}</strong><small>Personal account</small></span>
        <Icon name="settings" size={17}/>
      </button>
    </aside>
  </>;
}

function Topbar({ page, setPage, menu, query, setQuery }: { page: Page; setPage: (p: Page) => void; menu: () => void; query: string; setQuery: (q: string) => void }) {
  const { data } = useStore();
  return <header className="topbar">
    <button type="button" className="icon-btn menu-btn" onClick={menu} aria-label="Open menu"><Icon name="menu"/></button>
    <div className="top-title">{titles[page]}</div>
    <div className="top-actions">
      <label className="search-field"><Icon name="search" size={17}/><input placeholder="Search expenses..." aria-label="Search all expenses" value={query} onChange={(e) => { setQuery(e.target.value); if (page !== "expenses") setPage("expenses"); }}/></label>
      <span className="avatar desktop-avatar">{(data.settings.name[0] ?? "?").toUpperCase()}</span>
      <Button icon="plus" onClick={() => setPage("add")} className="top-add">Add Expense</Button>
    </div>
  </header>;
}

function Shell() {
  const { data, toast, storageOk } = useStore();
  const [page, setPageRaw] = useState<Page>("dashboard");
  const [menu, setMenu] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const setPage = (p: Page) => { setEditingId(null); setPageRaw(p); window.scrollTo?.(0, 0); };
  const startEdit = (id: string) => { setDetailId(null); setEditingId(id); setPageRaw("add"); window.scrollTo?.(0, 0); };

  const editing = editingId ? data.expenses.find((e) => e.id === editingId) : undefined;
  const detail = detailId ? data.expenses.find((e) => e.id === detailId) : undefined;

  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} open={menu} close={() => setMenu(false)}/>
    <main className="main"><Topbar page={page} setPage={setPage} menu={() => setMenu(true)} query={query} setQuery={setQuery}/>
      {!storageOk && <div className="warn-banner" role="alert">Your browser is blocking local storage, so your expenses will not be saved after you close or refresh this page.</div>}
      {page === "dashboard" && <Dashboard setPage={setPage} openDetail={setDetailId}/>}
      {page === "add" && <AddExpense key={editing?.id ?? "new"} editing={editing} done={() => setPage(editing ? "expenses" : "dashboard")} cancel={() => setPage(editing ? "expenses" : "dashboard")}/>}
      {page === "expenses" && <Expenses query={query} setQuery={setQuery} openDetail={setDetailId} edit={startEdit} add={() => setPage("add")}/>}
      {page === "categories" && <Categories/>}
      {page === "products" && <Products/>}
      {page === "reports" && <Reports/>}
      {page === "settings" && <SettingsPage/>}
    </main>
    <button type="button" className="fab" onClick={() => setPage("add")} aria-label="Add expense"><Icon name="plus" size={24}/></button>
    <nav className="bottom-nav">{navItems.slice(0, 5).map((item) => <button key={item.id} type="button" className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon name={item.icon}/><span>{item.label === "Add Expense" ? "Add" : item.label}</span></button>)}</nav>
    {detail && <ExpenseDetail expense={detail} close={() => setDetailId(null)} edit={() => startEdit(detail.id)}/>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

export default function App() {
  return <StoreProvider><Shell/></StoreProvider>;
}
