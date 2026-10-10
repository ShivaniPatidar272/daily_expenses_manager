import { useState } from "react";
import { Button, ConfirmModal, Icon, useEscape } from "../components/ui";
import { formatDateMedium, weekdayName } from "../lib/dates";
import { formatINR, pluralize } from "../lib/format";
import { expenseTotal } from "../lib/stats";
import type { Expense } from "../lib/types";
import { useStore } from "../store";

export default function ExpenseDetail({ expense, close, edit }: { expense: Expense; close: () => void; edit: () => void }) {
  const { dispatch, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  useEscape(() => { if (!confirm) close(); });
  return <div className="modal-layer"><div className="modal-scrim" onClick={close}/>
    <aside className="drawer" role="dialog" aria-modal="true" aria-label="Expense details">
      <div className="modal-head"><div><span className="eyebrow">Expense details</span><h2>{formatDateMedium(expense.date)}</h2></div><button type="button" className="icon-btn" onClick={close} aria-label="Close"><Icon name="close"/></button></div>
      <div className="detail-meta"><Icon name="calendar"/><span>{weekdayName(expense.date)}</span><span className="badge">{pluralize(expense.items.length, "item")}</span></div>
      <div className="detail-list">{expense.items.map((i) => <div key={i.id}><span className="product-cell"><i>{i.product[0]?.toUpperCase()}</i><span><strong>{i.product}</strong><small>{i.category || "No category"}</small></span></span><strong>{formatINR(i.amount)}</strong></div>)}</div>
      <div className="drawer-total"><span>Total Expense</span><strong>{formatINR(expenseTotal(expense))}</strong></div>
      <div className="drawer-actions"><Button variant="secondary" icon="edit" onClick={edit}>Edit Expense</Button><Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>Delete Expense</Button></div>
    </aside>
    {confirm && <ConfirmModal title="Delete expense?" message={`This will permanently delete this ${formatDateMedium(expense.date)} expense (${formatINR(expenseTotal(expense))}).`} onCancel={() => setConfirm(false)} onConfirm={() => { dispatch({ type: "deleteExpense", id: expense.id }); notify("Expense deleted"); close(); }}/>}
  </div>;
}
