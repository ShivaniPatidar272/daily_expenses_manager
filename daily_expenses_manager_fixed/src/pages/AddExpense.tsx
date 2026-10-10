import { useMemo, useState } from "react";
import { Button, Card, Icon, SelectField, TextInput } from "../components/ui";
import { formatDateLong, isValidDateStr, today } from "../lib/dates";
import { sortExpenses } from "../lib/filters";
import { formatINR, newId, parseAmount, round2 } from "../lib/format";
import type { Expense } from "../lib/types";
import { useStore } from "../store";

type Row = { key: string; product: string; category: string; amount: string };
const blankRow = (): Row => ({ key: newId(), product: "", category: "", amount: "" });

export default function AddExpense({ editing, done, cancel }: { editing?: Expense; done: () => void; cancel: () => void }) {
  const { data, dispatch, notify } = useStore();
  const [date, setDate] = useState(editing?.date ?? today());
  const [rows, setRows] = useState<Row[]>(editing ? editing.items.map((i) => ({ key: i.id, product: i.product, category: i.category, amount: String(i.amount) })) : [blankRow()]);
  const [focus, setFocus] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ date?: string; general?: string; rows: Record<string, { product?: string; amount?: string }> }>({ rows: {} });

  const categoryNames = data.categories.map((c) => c.name);
  // Rows whose saved category was removed are still shown correctly.
  const optionsFor = (current: string) => (current && !categoryNames.some((c) => c.toLowerCase() === current.toLowerCase()) ? [...categoryNames, current] : categoryNames);

  const total = useMemo(() => round2(rows.reduce((sum, r) => { const a = parseAmount(r.amount); return sum + (a.ok ? a.value : 0); }, 0)), [rows]);
  const update = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const productLib = data.products;
  const suggestionsFor = (text: string): string[] => {
    const q = text.trim().toLowerCase();
    const names = productLib.map((p) => p.name);
    const starts = names.filter((n) => n.toLowerCase().startsWith(q) && n.toLowerCase() !== q);
    const contains = names.filter((n) => !n.toLowerCase().startsWith(q) && n.toLowerCase().includes(q));
    return (q ? [...starts, ...contains] : []).slice(0, 6);
  };
  const categoryOf = (product: string) => productLib.find((p) => p.name.toLowerCase() === product.trim().toLowerCase())?.category ?? "";

  const choose = (key: string, product: string) => {
    const row = rows.find((r) => r.key === key);
    update(key, { product, category: row && row.category ? row.category : categoryOf(product) });
    setFocus(null);
  };

  const recentProducts = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const e of sortExpenses(data.expenses)) {
      for (const i of e.items) {
        const k = i.product.toLowerCase();
        if (!seen.has(k)) { seen.add(k); out.push(i.product); }
      }
      if (out.length >= 5) break;
    }
    return out.slice(0, 5);
  }, [data.expenses]);

  const save = () => {
    const next: typeof errors = { rows: {} };
    if (!isValidDateStr(date)) next.date = "Choose a valid date";
    const items: Expense["items"] = [];
    for (const r of rows) {
      const product = r.product.trim();
      const blank = !product && !r.amount.trim();
      if (blank) continue;
      const rowErr: { product?: string; amount?: string } = {};
      if (!product) rowErr.product = "Enter a product name";
      const amt = parseAmount(r.amount);
      if (!amt.ok) rowErr.amount = amt.error;
      if (rowErr.product || rowErr.amount) { next.rows[r.key] = rowErr; continue; }
      if (amt.ok) items.push({ id: editing?.items.find((i) => i.id === r.key)?.id ?? newId(), product: product.slice(0, 120), category: r.category, amount: amt.value });
    }
    if (Object.keys(next.rows).length === 0 && items.length === 0) next.general = "Add at least one item with a product name and an amount.";
    if (next.date || next.general || Object.keys(next.rows).length) { setErrors(next); return; }
    dispatch({ type: "saveExpense", expense: { id: editing?.id ?? newId(), date, items, createdAt: editing?.createdAt ?? Date.now() } });
    notify(editing ? "Expense updated" : `Expense saved · ${formatINR(total)}`);
    done();
  };

  return <div className="page narrow-page">
    <div className="page-heading"><div><h1>{editing ? "Edit Expense" : "Add Expense"}</h1><p>{editing ? "Update this day’s spending." : "Record your daily spending."}</p></div></div>
    <Card className="date-card"><div className="field-group"><label htmlFor="expense-date">Expense date</label><div className="date-input"><Icon name="calendar"/><TextInput id="expense-date" type="date" value={date} invalid={!!errors.date} onChange={setDate}/></div>
      {errors.date ? <small className="field-error">{errors.date}</small> : <small>{isValidDateStr(date) ? formatDateLong(date) : "Pick a date"}</small>}</div></Card>
    <Card className="items-card">
      <div className="card-head"><div><h2>Expense Items</h2><p>Add each product or service you paid for.</p></div><span className="item-count">{rows.length} {rows.length === 1 ? "item" : "items"}</span></div>
      <div className="item-labels"><span>Product</span><span>Category <small>Optional</small></span><span>Amount (₹)</span><span/></div>
      <div className="expense-items">
        {rows.map((r, i) => {
          const err = errors.rows[r.key];
          const sugg = focus === i ? suggestionsFor(r.product) : [];
          return <div className="expense-item" key={r.key}>
            <span className="item-number">{i + 1}</span>
            <div className="autocomplete">
              <TextInput value={r.product} placeholder="e.g. Milk" label={`Product ${i + 1}`} maxLength={120} autoComplete="off" invalid={!!err?.product}
                onChange={(v) => { update(r.key, { product: v }); setFocus(i); }} onFocus={() => setFocus(i)} onBlur={() => setFocus((f) => (f === i ? null : f))}
                onKeyDown={(e) => { if (e.key === "Escape") setFocus(null); }}/>
              {sugg.length > 0 && <div className="suggestions" role="listbox" onMouseDown={(e) => e.preventDefault()}>{sugg.map((s) => <button type="button" role="option" key={s} onClick={() => choose(r.key, s)}><Icon name="search" size={14}/>{s}</button>)}</div>}
              {err?.product && <small className="field-error">{err.product}</small>}
            </div>
            <div><SelectField label={`Category ${i + 1}`} value={r.category} onChange={(v) => update(r.key, { category: v })}><option value="">No category</option>{optionsFor(r.category).map((c) => <option key={c} value={c}>{c}</option>)}</SelectField></div>
            <div className="money-input"><span>₹</span><TextInput type="number" inputMode="decimal" min="0" step="0.01" value={r.amount} placeholder="0" label={`Amount ${i + 1}`} invalid={!!err?.amount} onChange={(v) => update(r.key, { amount: v })}/>{err?.amount && <small className="field-error">{err.amount}</small>}</div>
            <button type="button" className="icon-btn danger-icon" aria-label={`Remove item ${i + 1}`} onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [blankRow()]))}><Icon name="trash"/></button>
          </div>;
        })}
      </div>
      <Button variant="secondary" icon="plus" onClick={() => setRows([...rows, blankRow()])}>Add Item</Button>
      {recentProducts.length > 0 && <div className="recent-products"><span>Recently used</span>{recentProducts.map((p) => <button type="button" key={p} onClick={() => setRows((rs) => { const row = { ...blankRow(), product: p, category: categoryOf(p) }; return rs.length === 1 && !rs[0].product.trim() && !rs[0].amount.trim() ? [row] : [...rs, row]; })}><Icon name="plus" size={13}/>{p}</button>)}</div>}
      <div className="total-box"><div><span>Subtotal</span><strong>{formatINR(total)}</strong></div><div className="grand-total"><span>Total Expense</span><strong>{formatINR(total)}</strong></div></div>
      {errors.general && <p className="form-error" role="alert">{errors.general}</p>}
      <div className="form-actions"><Button variant="ghost" onClick={cancel}>Cancel</Button><Button icon="receipt" onClick={save}>{editing ? "Save Changes" : "Save Expense"}</Button></div>
    </Card>
  </div>;
}
