import { useMemo, useState } from "react";
import { Button, Card, ConfirmModal, EmptyState, Icon, Modal, TextInput } from "../components/ui";
import { endOfMonth, startOfMonth, today } from "../lib/dates";
import { formatINR, newId, pluralize } from "../lib/format";
import type { Category } from "../lib/types";
import { useStore } from "../store";

function CategoryForm({ existing, close }: { existing?: Category; close: () => void }) {
  const { data, dispatch, notify } = useStore();
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [error, setError] = useState("");
  const submit = () => {
    const n = name.trim();
    if (!n) return setError("Enter a category name");
    if (data.categories.some((c) => c.id !== existing?.id && c.name.toLowerCase() === n.toLowerCase())) return setError("A category with this name already exists");
    dispatch({ type: "saveCategory", category: { id: existing?.id ?? newId(), name: n, description: description.trim() } });
    notify(existing ? "Category updated" : "Category created");
    close();
  };
  return <Modal title={existing ? "Edit Category" : "Add Category"} close={close}>
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="modal-form">
      <div className="field-group"><label htmlFor="cat-name">Category Name</label><TextInput id="cat-name" autoFocus maxLength={40} placeholder="e.g. Personal Care" value={name} invalid={!!error} onChange={(v) => { setName(v); setError(""); }}/>{error && <small className="field-error">{error}</small>}</div>
      <div className="field-group"><label htmlFor="cat-desc">Description <small>Optional</small></label><textarea id="cat-desc" className="input textarea" maxLength={200} placeholder="What expenses belong here?" value={description} onChange={(e) => setDescription(e.target.value)}/></div>
      <div className="form-actions"><Button variant="ghost" onClick={close}>Cancel</Button><Button type="submit">{existing ? "Save Changes" : "Create Category"}</Button></div>
    </form>
  </Modal>;
}

export default function Categories() {
  const { data, dispatch, notify } = useStore();
  const [form, setForm] = useState<{ existing?: Category } | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const stats = useMemo(() => {
    const t = today();
    const month = { start: startOfMonth(t), end: endOfMonth(t) };
    const map = new Map<string, { products: Set<string>; spent: number; uses: number }>();
    for (const e of data.expenses) for (const i of e.items) {
      const key = i.category.toLowerCase();
      const cur = map.get(key) ?? { products: new Set<string>(), spent: 0, uses: 0 };
      cur.products.add(i.product.toLowerCase());
      cur.uses += 1;
      if (e.date >= month.start && e.date <= month.end) cur.spent += i.amount;
      map.set(key, cur);
    }
    return map;
  }, [data.expenses]);

  return <div className="page">
    <div className="page-heading"><div><h1>Categories</h1><p>Organize your expenses by category.</p></div><Button icon="plus" onClick={() => setForm({})}>Add Category</Button></div>
    {data.categories.length === 0
      ? <Card><EmptyState title="No categories" text="Categories are optional. Create one to group your expenses." action={<Button icon="plus" onClick={() => setForm({})}>Add Category</Button>}/></Card>
      : <div className="category-grid">{data.categories.map((c) => {
        const s = stats.get(c.name.toLowerCase());
        return <Card className="manage-category" key={c.id}><div className="category-icon">{c.name[0]?.toUpperCase()}</div>
          <div className="category-copy"><h3>{c.name}</h3><p>{pluralize(s?.products.size ?? 0, "product")}</p>{c.description && <p className="category-desc">{c.description}</p>}<strong>{formatINR(s?.spent ?? 0)} <small>spent this month</small></strong></div>
          <div className="category-actions"><button type="button" className="icon-btn" aria-label={`Edit ${c.name}`} onClick={() => setForm({ existing: c })}><Icon name="edit"/></button><button type="button" className="icon-btn danger-icon" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}><Icon name="trash"/></button></div></Card>;
      })}</div>}
    {form && <CategoryForm existing={form.existing} close={() => setForm(null)}/>}
    {toDelete && <ConfirmModal title="Delete category?" message={<>“{toDelete.name}” will be removed. {(stats.get(toDelete.name.toLowerCase())?.uses ?? 0) > 0 ? `${pluralize(stats.get(toDelete.name.toLowerCase())!.uses, "expense item")} that use it will become uncategorized, but no expenses are deleted.` : "No expenses use it."}</>} onCancel={() => setToDelete(null)} onConfirm={() => { dispatch({ type: "deleteCategory", id: toDelete.id }); setToDelete(null); notify("Category deleted"); }}/>}
  </div>;
}
