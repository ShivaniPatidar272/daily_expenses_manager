import { useMemo, useState } from "react";
import { Button, Card, ConfirmModal, EmptyState, Icon, Modal, SelectField, TextInput } from "../components/ui";
import { relativeDay, today } from "../lib/dates";
import { formatINR, newId } from "../lib/format";
import { productStats } from "../lib/stats";
import type { SavedProduct } from "../lib/types";
import { useStore } from "../store";

function ProductForm({ existing, close }: { existing?: SavedProduct; close: () => void }) {
  const { data, dispatch, notify } = useStore();
  const [name, setName] = useState(existing?.name ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [error, setError] = useState("");
  const submit = () => {
    const n = name.trim();
    if (!n) return setError("Enter a product name");
    if (data.products.some((p) => p.id !== existing?.id && p.name.toLowerCase() === n.toLowerCase())) return setError("This product already exists");
    dispatch({ type: "saveProduct", product: { id: existing?.id ?? newId(), name: n, category } });
    notify(existing ? "Product updated" : "Product saved");
    close();
  };
  return <Modal title={existing ? "Edit Product" : "Add Product"} close={close}>
    <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="field-group"><label htmlFor="prod-name">Product name</label><TextInput id="prod-name" autoFocus maxLength={120} placeholder="e.g. Paneer" value={name} invalid={!!error} onChange={(v) => { setName(v); setError(""); }}/>{error && <small className="field-error">{error}</small>}{existing && <small>Renaming also updates this product in your expense history.</small>}</div>
      <div className="field-group"><label>Default category <small>Optional</small></label><SelectField label="Default category" value={category} onChange={setCategory}><option value="">No category</option>{data.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</SelectField></div>
      <div className="form-actions"><Button variant="ghost" onClick={close}>Cancel</Button><Button type="submit">{existing ? "Save Changes" : "Save Product"}</Button></div>
    </form>
  </Modal>;
}

export default function Products() {
  const { data, dispatch, notify } = useStore();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [form, setForm] = useState<{ existing?: SavedProduct } | null>(null);
  const [toDelete, setToDelete] = useState<SavedProduct | null>(null);
  const t = today();

  const stats = useMemo(() => productStats(data.expenses), [data.expenses]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.products
      .filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!cat || (cat === "__none__" ? !p.category : p.category.toLowerCase() === cat.toLowerCase())))
      .map((p) => ({ p, s: stats.get(p.name.toLowerCase()) }))
      .sort((a, b) => (b.s?.count ?? 0) - (a.s?.count ?? 0) || a.p.name.localeCompare(b.p.name));
  }, [data.products, stats, search, cat]);

  return <div className="page"><div className="page-heading"><div><h1>Products</h1><p>Manage your saved products and autocomplete suggestions.</p></div><Button icon="plus" onClick={() => setForm({})}>Add Product</Button></div>
    <div className="quick-row product-toolbar"><label className="search-field page-search"><Icon name="search"/><input placeholder="Search products..." aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)}/></label><SelectField label="Category filter" value={cat} onChange={setCat}><option value="">All categories</option><option value="__none__">No category</option>{data.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</SelectField></div>
    <Card className="data-card"><div className="card-head"><div><h2>Saved products</h2><p>{data.products.length} {data.products.length === 1 ? "product" : "products"} in your library</p></div></div>
      {rows.length === 0
        ? <EmptyState title={data.products.length ? "No products match" : "No products yet"} text={data.products.length ? "Try a different search or category." : "Products are saved automatically when you add expenses, or add one yourself."}/>
        : <div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Times Used</th><th>Last Used</th><th>Total Spent</th><th>Actions</th></tr></thead><tbody>
          {rows.map(({ p, s }) => <tr key={p.id} onClick={() => setForm({ existing: p })}><td><span className="product-cell"><i>{p.name[0]?.toUpperCase()}</i><strong>{p.name}</strong></span></td><td>{p.category ? <span className="badge">{p.category}</span> : "—"}</td><td>{s ? `${s.count} ${s.count === 1 ? "time" : "times"}` : "Not used yet"}</td><td>{s ? relativeDay(s.lastDate, t) : "—"}</td><td><strong>{formatINR(s?.amount ?? 0)}</strong></td>
            <td><div className="row-actions" onClick={(e) => e.stopPropagation()}><button type="button" aria-label={`Edit ${p.name}`} onClick={() => setForm({ existing: p })}><Icon name="edit" size={15}/></button><button type="button" aria-label={`Delete ${p.name}`} className="danger-text" onClick={() => setToDelete(p)}><Icon name="trash" size={15}/></button></div></td></tr>)}
        </tbody></table></div>}
    </Card>
    {form && <ProductForm existing={form.existing} close={() => setForm(null)}/>}
    {toDelete && <ConfirmModal title="Remove product?" message={`“${toDelete.name}” will be removed from your saved products and suggestions. Your expense history is not changed.`} confirmLabel="Remove" onCancel={() => setToDelete(null)} onConfirm={() => { dispatch({ type: "deleteProduct", id: toDelete.id }); setToDelete(null); notify("Product removed"); }}/>}
  </div>;
}
