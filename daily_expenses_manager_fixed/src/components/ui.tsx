import { useEffect, type ChangeEvent, type ReactNode } from "react";

export type IconName =
  | "logo" | "grid" | "plus" | "receipt" | "tag" | "box" | "chart" | "settings"
  | "search" | "bell" | "wallet" | "calendar" | "arrowUp" | "arrowDown"
  | "more" | "trash" | "edit" | "close" | "chevron" | "filter" | "menu"
  | "food" | "travel" | "shopping" | "bills" | "download";

const paths: Record<IconName, React.ReactNode> = {
  logo: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="M8 10h8M9 14h6"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></>,
  tag: <><path d="M20 13 13 20l-9-9V4h7z"/><circle cx="8.5" cy="8.5" r="1"/></>,
  box: <><path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15 2 2 0 0 0 3 13.8H3v-3.6h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6 2 2 0 0 0 10.2 3V3h3.6v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 1.8 2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  wallet: <><path d="M3 6h16v14H3zM3 6l3-3h12v3M15 12h4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  arrowUp: <><path d="m18 15-6-6-6 6"/></>,
  arrowDown: <><path d="m6 9 6 6 6-6"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  chevron: <><path d="m9 18 6-6-6-6"/></>,
  filter: <><path d="M3 5h18l-7 8v6l-4 2v-8z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  food: <><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c5 3 5 9 0 11"/></>,
  travel: <><path d="M3 11h18M6 17h12M5 11l2-6h10l2 6v6H5z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></>,
  shopping: <><path d="M5 8h14l-1 13H6zM9 8a3 3 0 0 1 6 0"/></>,
  bills: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/></>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/></>,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function Button({ children, variant = "primary", icon, onClick, className = "", disabled, type = "button" }: { children?: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; className?: string; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} disabled={disabled} className={`btn btn-${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} size={16}/>} {children}</button>;
}

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  id?: string;
  label?: string;
  invalid?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  inputMode?: "decimal" | "text" | "numeric";
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function TextInput({ value, onChange, label, invalid, ...rest }: InputProps) {
  return <input className={`input${invalid ? " input-invalid" : ""}`} aria-label={label} aria-invalid={invalid || undefined} value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} {...rest}/>;
}

export function SelectField({ children, value, onChange, label }: { children: ReactNode; value: string; onChange: (value: string) => void; label?: string }) {
  return <select className="input" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Segmented<T extends string>({ items, active, setActive }: { items: readonly T[]; active: T; setActive: (s: T) => void }) {
  return <div className="segmented">{items.map((item) => <button key={item} type="button" className={active === item ? "selected" : ""} onClick={() => setActive(item)}>{item}</button>)}</div>;
}

export function useEscape(handler: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handler(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler]);
}

export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  useEscape(close);
  return <div className="modal-layer"><div className="modal-scrim" onClick={close}/><div className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><h2>{title}</h2><button type="button" className="icon-btn" onClick={close} aria-label="Close"><Icon name="close"/></button></div>{children}</div></div>;
}

export function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: { title: string; message: ReactNode; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return <Modal title={title} close={onCancel}>
    <p className="confirm-text">{message}</p>
    <div className="form-actions"><Button variant="ghost" onClick={onCancel}>Cancel</Button><Button variant="danger" icon="trash" onClick={onConfirm}>{confirmLabel}</Button></div>
  </Modal>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return <div className="empty-state"><strong>{title}</strong>{text && <p>{text}</p>}{action}</div>;
}
