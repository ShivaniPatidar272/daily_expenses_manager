import { useRef, useState } from "react";
import { Button, Card, ConfirmModal, SelectField, TextInput } from "../components/ui";
import { today } from "../lib/dates";
import { downloadText } from "../lib/filters";
import { pluralize } from "../lib/format";
import { sanitize } from "../lib/storage";
import type { AppData } from "../lib/types";
import { useStore } from "../store";

export default function SettingsPage() {
  const { data, dispatch, notify, storageOk } = useStore();
  const [name, setName] = useState(data.settings.name);
  const [nameError, setNameError] = useState("");
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [importError, setImportError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveName = () => {
    const n = name.trim();
    if (!n) return setNameError("Enter your name");
    dispatch({ type: "setName", name: n });
    setNameError("");
    notify("Settings saved");
  };

  const onFile = async (file: File | undefined) => {
    setImportError("");
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("File is too large");
      const raw: unknown = JSON.parse(await file.text());
      if (typeof raw !== "object" || raw === null || !("expenses" in raw)) throw new Error("not a backup");
      setPendingImport(sanitize(raw));
    } catch {
      setImportError("That file isn’t a valid Daily Expense Manager backup (.json).");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return <div className="page narrow-page"><div className="page-heading"><div><h1>Settings</h1><p>Manage your preferences and data.</p></div></div>
    <Card>
      <div className="settings-profile"><span className="avatar large">{(data.settings.name[0] ?? "?").toUpperCase()}</span><div><h2>{data.settings.name}</h2><p>Personal expense account</p></div></div>
      <form className="settings-form" onSubmit={(e) => { e.preventDefault(); saveName(); }}>
        <div className="field-group"><label htmlFor="full-name">Full name</label><TextInput id="full-name" maxLength={40} value={name} invalid={!!nameError} onChange={(v) => { setName(v); setNameError(""); }}/>{nameError && <small className="field-error">{nameError}</small>}</div>
        <div className="field-group"><label>Currency</label><SelectField label="Currency" value="INR" onChange={() => undefined}><option value="INR">Indian Rupee (₹)</option></SelectField><small>All amounts are in Indian rupees.</small></div>
        <div className="form-actions settings-actions"><Button type="submit">Save Changes</Button></div>
      </form>
    </Card>
    <Card className="data-settings">
      <div className="card-head"><div><h2>Your data</h2><p>{storageOk ? "Saved only in this browser on this device. Nothing is sent to a server." : "Your browser is blocking storage, so changes will be lost when you close the tab."}</p></div></div>
      <p className="muted-text">{pluralize(data.expenses.length, "expense")} · {`${data.categories.length} ${data.categories.length === 1 ? "category" : "categories"}`} · {pluralize(data.products.length, "product")}</p>
      <div className="data-actions">
        <Button variant="secondary" icon="download" onClick={() => { downloadText(`daily-expenses-backup-${today()}.json`, JSON.stringify(data, null, 2), "application/json"); notify("Backup downloaded"); }}>Download backup</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>Restore from backup</Button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e.target.files?.[0])}/>
        <Button variant="danger" icon="trash" onClick={() => setConfirmClear(true)}>Delete all data</Button>
      </div>
      {importError && <p className="form-error" role="alert">{importError}</p>}
    </Card>
    {pendingImport && <ConfirmModal title="Restore this backup?" confirmLabel="Replace my data" message={`This replaces everything currently saved with the backup (${pluralize(pendingImport.expenses.length, "expense")}). Download a backup first if you want to keep the current data.`} onCancel={() => setPendingImport(null)} onConfirm={() => { dispatch({ type: "replaceAll", data: pendingImport }); setName(pendingImport.settings.name); setPendingImport(null); notify("Backup restored"); }}/>}
    {confirmClear && <ConfirmModal title="Delete all data?" confirmLabel="Delete everything" message="All expenses, products and categories saved in this browser will be permanently deleted and the default categories restored. This cannot be undone." onCancel={() => setConfirmClear(false)} onConfirm={() => { dispatch({ type: "reset" }); setConfirmClear(false); setName("Shivani"); notify("All data deleted"); }}/>}
  </div>;
}
