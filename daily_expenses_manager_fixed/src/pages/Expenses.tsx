import { useMemo, useState } from "react";
import { Button, Card, ConfirmModal, EmptyState, Icon, SelectField, Segmented, TextInput } from "../components/ui";
import { formatDate, rangeFor, today, type RangeKind } from "../lib/dates";
import { downloadText, emptyFilters, expensesToCsv, filterExpenses, hasActiveFilters, sortExpenses, type Filters } from "../lib/filters";
import { formatINR, pluralize } from "../lib/format";
import { expenseTotal } from "../lib/stats";
import type { Expense } from "../lib/types";
import { useStore } from "../store";

const QUICK = ["All Time", "Today", "This Week", "This Month", "This Year"] as const;
type Quick = (typeof QUICK)[number];
const PAGE_SIZE = 50;

export default function Expenses({ query, setQuery, openDetail, edit, add }: { query: string; setQuery: (q: string) => void; openDetail: (id: string) => void; edit: (id: string) => void; add: () => void }) {
  const { data, dispatch, notify } = useStore();
  const [quick, setQuick] = useState<Quick>("All Time");
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  const quickRange = quick === "All Time" ? null : rangeFor(quick as RangeKind, today(), { start: "", end: "" });
  const rows = useMemo(
    () => sortExpenses(filterExpenses(data.expenses, quickRange, applied, query)),
    [data.expenses, quick, applied, query],
  );
  const total = rows.reduce((s, e) => s + expenseTotal(e), 0);
  const filtering = quick !== "All Time" || hasActiveFilters(applied) || query.trim() !== "";
  const categoryNames = data.categories.map((c) => c.name);

  const clearAll = () => { setQuick("All Time"); setDraft(emptyFilters); setApplied(emptyFilters); setQuery(""); setLimit(PAGE_SIZE); };
  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));
  const apply = () => { setApplied(draft); setLimit(PAGE_SIZE); };
  const dateProblem = draft.from && draft.to && draft.from > draft.to;

  return <div className="page">
    <div className="page-heading"><div><h1>All Expenses</h1><p>Track and manage your spending history.</p></div><Button icon="plus" onClick={add}>Add Expense</Button></div>
    <div className="quick-row"><Segmented items={QUICK} active={quick} setActive={(q) => { setQuick(q); setLimit(PAGE_SIZE); }}/><label className="search-field page-search"><Icon name="search"/><input placeholder="Search expenses" aria-label="Search expenses" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}/></label></div>
    <Card className="filters"><div className="filter-title"><Icon name="filter"/><strong>Filters</strong></div>
      <form className="filter-grid" onSubmit={(e) => { e.preventDefault(); if (!dateProblem) apply(); }}>
        <div><label>From date</label><TextInput type="date" label="From date" value={draft.from} onChange={(v) => set({ from: v })}/></div>
        <div><label>To date</label><TextInput type="date" label="To date" value={draft.to} onChange={(v) => set({ to: v })}/></div>
        <div><label>Category</label><SelectField label="Category filter" value={draft.category} onChange={(v) => set({ category: v })}><option value="">All categories</option><option value="__none__">No category</option>{categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}</SelectField></div>
        <div><label>Product</label><TextInput placeholder="All products" label="Product filter" value={draft.product} onChange={(v) => set({ product: v })}/></div>
        <div><label>Min total</label><TextInput type="number" min="0" placeholder="₹ 0" label="Minimum total" value={draft.min} onChange={(v) => set({ min: v })}/></div>
        <div><label>Max total</label><TextInput type="number" min="0" placeholder="₹ 10,000" label="Maximum total" value={draft.max} onChange={(v) => set({ max: v })}/></div>
        <Button type="submit" disabled={!!dateProblem}>Apply Filters</Button>
      </form>
      {dateProblem && <p className="form-error">“From date” must be on or before “To date”.</p>}
      {filtering && <div className="filter-note"><span>Showing {rows.length === 1 ? "1 entry" : `${rows.length} entries`} · {formatINR(total)}</span><button type="button" onClick={clearAll}>Clear filters</button></div>}
    </Card>
    <Card className="data-card"><div className="card-head"><div><h2>Expense history</h2><p>{rows.length === 1 ? "1 entry" : `${rows.length} entries`}{filtering ? " match your filters" : ""}</p></div>
      <Button variant="secondary" icon="download" disabled={!rows.length} onClick={() => { downloadText(`expenses-${today()}.csv`, expensesToCsv(rows), "text/csv"); notify("CSV exported"); }}>Export</Button></div>
      {rows.length === 0
        ? data.expenses.length === 0
          ? <EmptyState title="No expenses yet" text="Your saved expenses will appear here." action={<Button icon="plus" onClick={add}>Add your first expense</Button>}/>
          : <EmptyState title="No expenses match" text="Try changing or clearing the filters." action={<Button variant="secondary" onClick={clearAll}>Clear filters</Button>}/>
        : <div className="table-scroll"><table><thead><tr><th>Date</th><th>Items</th><th>Categories</th><th>Total Amount</th><th>Actions</th></tr></thead><tbody>
          {rows.slice(0, limit).map((e) => {
            const cats = [...new Set(e.items.map((i) => i.category).filter(Boolean))];
            return <tr key={e.id} onClick={() => openDetail(e.id)}><td><strong>{formatDate(e.date)}</strong></td><td>{pluralize(e.items.length, "item")}</td><td>{cats.length ? <span className="badge">{cats.join(", ")}</span> : "—"}</td><td><strong>{formatINR(expenseTotal(e))}</strong></td>
              <td><div className="row-actions" onClick={(ev) => ev.stopPropagation()}><button type="button" onClick={() => openDetail(e.id)}>View</button><button type="button" aria-label="Edit expense" onClick={() => edit(e.id)}><Icon name="edit" size={15}/></button><button type="button" aria-label="Delete expense" className="danger-text" onClick={() => setToDelete(e)}><Icon name="trash" size={15}/></button></div></td></tr>;
          })}</tbody></table></div>}
      {rows.length > limit && <div className="load-more"><Button variant="secondary" onClick={() => setLimit(limit + PAGE_SIZE)}>Show more ({rows.length - limit} remaining)</Button></div>}
    </Card>
    {toDelete && <ConfirmModal title="Delete expense?" message={`This will permanently delete the ${formatDate(toDelete.date)} expense (${formatINR(expenseTotal(toDelete))}, ${pluralize(toDelete.items.length, "item")}).`} onCancel={() => setToDelete(null)} onConfirm={() => { dispatch({ type: "deleteExpense", id: toDelete.id }); setToDelete(null); notify("Expense deleted"); }}/>}
  </div>;
}
