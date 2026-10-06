import { useMemo, useState } from "react";

type Page = "dashboard" | "add" | "expenses" | "categories" | "products" | "reports" | "settings";
type IconName =
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

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Button({ children, variant = "primary", icon, onClick, className = "" }: { children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; className?: string }) {
  return <button className={`btn btn-${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} size={16}/>} {children}</button>;
}

function TextInput({ placeholder, value, onChange, type = "text" }: { placeholder?: string; value?: string; onChange?: (value: string) => void; type?: string }) {
  const valueProps = onChange
    ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
    : { defaultValue: value };
  return <input className="input" type={type} placeholder={placeholder} {...valueProps}/>;
}

function SelectField({ children, value, onChange }: { children: React.ReactNode; value?: string; onChange?: (value: string) => void }) {
  return <select className="input" value={value} onChange={(e) => onChange?.(e.target.value)}>{children}</select>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "add", label: "Add Expense", icon: "plus" },
  { id: "expenses", label: "Expenses", icon: "receipt" },
  { id: "categories", label: "Categories", icon: "tag" },
  { id: "products", label: "Products", icon: "box" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const categories = [
  ["Food", "₹7,850", "32%", "food"], ["Vegetables", "₹4,250", "17%", "veg"],
  ["Travel", "₹3,850", "16%", "travel"], ["Shopping", "₹3,250", "13%", "shopping"],
  ["Drinks", "₹2,100", "9%", "drinks"], ["Bills", "₹2,100", "8%", "bills"], ["Other", "₹1,180", "5%", "other"],
];

const recent = [
  ["26 Sep 2026", "Milk", "Dairy", "₹60", "UPI"],
  ["26 Sep 2026", "Vegetables", "Vegetables", "₹180", "Cash"],
  ["26 Sep 2026", "Auto Rickshaw", "Travel", "₹120", "Cash"],
  ["25 Sep 2026", "Coffee", "Drinks", "₹150", "UPI"],
  ["25 Sep 2026", "Grocery", "Grocery", "₹850", "Card"],
];

function Sidebar({ page, setPage, open, close }: { page: Page; setPage: (p: Page) => void; open: boolean; close: () => void }) {
  return <>
    {open && <div className="scrim mobile-only" onClick={close}/>}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="logo"><Icon name="logo" size={21}/></span><span>Daily Expense<br/>Manager</span></div>
      <nav className="nav-list">
        {navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); close(); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}
      </nav>
      <div className="profile">
        <span className="avatar">S</span>
        <span className="profile-copy"><strong>Shivani</strong><small>Personal account</small></span>
        <Icon name="settings" size={17}/>
      </div>
    </aside>
  </>;
}

function Topbar({ page, setPage, menu }: { page: Page; setPage: (p: Page) => void; menu: () => void }) {
  const titles: Record<Page, string> = { dashboard: "Dashboard", add: "Add Expense", expenses: "All Expenses", categories: "Categories", products: "Products", reports: "Reports & Analytics", settings: "Settings" };
  return <header className="topbar">
    <button className="icon-btn menu-btn" onClick={menu} aria-label="Open menu"><Icon name="menu"/></button>
    <div className="top-title">{titles[page]}</div>
    <div className="top-actions">
      <label className="search-field"><Icon name="search" size={17}/><input placeholder="Search expenses..."/></label>
      <button className="icon-btn notification" aria-label="Notifications"><Icon name="bell" size={19}/><i/></button>
      <span className="avatar desktop-avatar">S</span>
      <Button icon="plus" onClick={() => setPage("add")} className="top-add">Add Expense</Button>
    </div>
  </header>;
}

function Segmented({ items, active, setActive }: { items: string[]; active: string; setActive: (s: string) => void }) {
  return <div className="segmented">{items.map((item) => <button key={item} className={active === item ? "selected" : ""} onClick={() => setActive(item)}>{item}</button>)}</div>;
}

function AreaChart() {
  return <div className="chart-wrap">
    <div className="y-axis"><span>₹2k</span><span>₹1.5k</span><span>₹1k</span><span>₹500</span><span>₹0</span></div>
    <svg className="line-chart" viewBox="0 0 700 230" preserveAspectRatio="none">
      <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity=".22"/><stop offset="100%" stopColor="var(--green)" stopOpacity="0"/></linearGradient></defs>
      <g className="grid-lines"><path d="M0 10H700M0 62H700M0 114H700M0 166H700M0 218H700"/></g>
      <path className="area" d="M0 132 C45 125 70 75 116 87 S180 170 233 154 S305 42 350 66 S420 130 466 112 S535 17 583 42 S650 92 700 82 V220H0Z"/>
      <path className="line" d="M0 132 C45 125 70 75 116 87 S180 170 233 154 S305 42 350 66 S420 130 466 112 S535 17 583 42 S650 92 700 82"/>
      {[["0","132"],["116","87"],["233","154"],["350","66"],["466","112"],["583","42"],["700","82"]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="5"/>)}
    </svg>
    <div className="x-axis">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <span key={d}>{d}</span>)}</div>
  </div>;
}

function Dashboard({ setPage, openDetail }: { setPage: (p: Page) => void; openDetail: () => void }) {
  const [range, setRange] = useState("This Month");
  const [chartRange, setChartRange] = useState("Weekly");
  const stats = [
    ["Today’s Expense", "₹1,250", "+8.2%", "vs yesterday", "wallet", "up"],
    ["This Week", "₹6,850", "+5.4%", "vs last week", "calendar", "up"],
    ["This Month", "₹24,580", "-3.2%", "vs last month", "chart", "down"],
    ["This Year", "₹2,85,420", "", "Total spending", "receipt", ""],
  ];
  return <div className="page">
    <div className="page-heading dashboard-heading">
      <div><h1>Good afternoon, Shivani</h1><p>Here’s your spending overview.</p></div>
      <Segmented items={["Today", "This Week", "This Month", "This Year", "Custom"]} active={range} setActive={setRange}/>
    </div>
    <div className="stats-grid">
      {stats.map(([label, amount, change, note, icon, trend]) => <Card key={label} className="stat-card">
        <div className="stat-top"><span className="stat-icon"><Icon name={icon as IconName}/></span><Icon name="more" size={18}/></div>
        <span className="eyebrow">{label}</span><strong className="stat-value">{amount}</strong>
        <div className="stat-foot">{change && <span className={`trend ${trend}`}><Icon name={trend === "up" ? "arrowUp" : "arrowDown"} size={12}/>{change}</span>}<span>{note}</span></div>
      </Card>)}
    </div>
    <div className="dashboard-grid">
      <Card className="overview-card">
        <div className="card-head"><div><h2>Expense Overview</h2><p>Your spending pattern this week</p></div><div className="chart-head-right"><strong>Total: ₹7,900</strong><Segmented items={["Weekly","Monthly","Yearly"]} active={chartRange} setActive={setChartRange}/></div></div>
        <AreaChart/>
      </Card>
      <Card className="category-card">
        <div className="card-head"><div><h2>Spending by Category</h2><p>This month</p></div><button className="icon-btn"><Icon name="more"/></button></div>
        <div className="donut-zone">
          <div className="donut"><div><strong>₹24,580</strong><span>Total</span></div></div>
          <div className="legend">{categories.map(([name, amount, percent, color]) => <div className="legend-row" key={name}><i className={`dot ${color}`}/><span>{name}</span><strong>{amount}</strong><small>{percent}</small></div>)}</div>
        </div>
      </Card>
      <Card className="recent-card">
        <div className="card-head"><div><h2>Recent Expenses</h2><p>Your latest transactions</p></div><Button variant="secondary" onClick={() => setPage("expenses")}>View All Expenses <Icon name="chevron" size={14}/></Button></div>
        <div className="table-scroll"><table><thead><tr><th>Date</th><th>Product</th><th>Category</th><th>Amount</th><th>Payment</th><th/></tr></thead>
          <tbody>{recent.map((r) => <tr key={r.join("-")} onClick={openDetail}><td>{r[0]}</td><td><span className="product-cell"><i>{r[1][0]}</i>{r[1]}</span></td><td><span className="badge">{r[2]}</span></td><td><strong>{r[3]}</strong></td><td>{r[4]}</td><td><button className="icon-btn"><Icon name="more"/></button></td></tr>)}</tbody></table></div>
      </Card>
      <Card className="top-categories">
        <div className="card-head"><div><h2>Top Categories</h2><p>By total spending</p></div></div>
        {[["Food","₹7,850","100%"],["Vegetables","₹4,250","54%"],["Travel","₹3,850","49%"],["Shopping","₹3,250","41%"],["Drinks","₹2,100","27%"]].map(([n,a,w]) => <div className="bar-row" key={n}><div><span>{n}</span><strong>{a}</strong></div><div className="bar"><i style={{width:w}}/></div></div>)}
      </Card>
      <Card className="monthly-card">
        <div className="card-head"><div><h2>Monthly Comparison</h2><p>Income, expenses and savings</p></div><div className="mini-legend"><span><i className="income"/>Income</span><span><i className="expense"/>Expenses</span><span><i className="saving"/>Savings</span></div></div>
        <div className="column-chart">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"].map((m,i) => <div className="column" key={m}><div><i className="income" style={{height:`${55 + (i%3)*13}%`}}/><i className="expense" style={{height:`${34 + (i%4)*10}%`}}/><i className="saving" style={{height:`${18 + (i%2)*10}%`}}/></div><span>{m}</span></div>)}</div>
      </Card>
    </div>
  </div>;
}

type ExpenseItem = { product: string; amount: number; category: string };
const categoryOptions = ["Dairy","Vegetables","Fruits","Drinks","Grocery","Food","Travel","Shopping","Bills","Health","Entertainment","Other"];

function AddExpense({ done }: { done: () => void }) {
  const [items, setItems] = useState<ExpenseItem[]>([
    { product: "Milk", amount: 60, category: "Dairy" },
    { product: "Potato", amount: 80, category: "Vegetables" },
    { product: "Tomato", amount: 50, category: "Vegetables" },
    { product: "Cold Drink", amount: 100, category: "Drinks" },
  ]);
  const [focus, setFocus] = useState<number | null>(null);
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0), 0), [items]);
  const update = (i: number, patch: Partial<ExpenseItem>) => setItems(items.map((item, index) => index === i ? {...item, ...patch} : item));
  return <div className="page narrow-page">
    <div className="page-heading"><div><h1>Add Expense</h1><p>Record your daily spending.</p></div></div>
    <Card className="date-card"><div className="field-group"><label>Expense date</label><div className="date-input"><Icon name="calendar"/><TextInput type="date" value="2026-09-26"/></div><small>Saturday, 26 September 2026</small></div></Card>
    <Card className="items-card">
      <div className="card-head"><div><h2>Expense Items</h2><p>Add each product or service you paid for.</p></div><span className="item-count">{items.length} items</span></div>
      <div className="item-labels"><span>Product</span><span>Category <small>Optional</small></span><span>Amount</span><span/></div>
      <div className="expense-items">
        {items.map((item, i) => <div className="expense-item" key={i}>
          <span className="item-number">{i + 1}</span>
          <div className="autocomplete"><TextInput value={item.product} placeholder="e.g. Milk" onChange={(v) => { update(i,{product:v}); setFocus(i); }}/>{focus === i && item.product.toLowerCase().startsWith("mi") && <div className="suggestions">{["Milk","Milk Powder","Milkshake"].map(s => <button onClick={() => {update(i,{product:s});setFocus(null);}} key={s}><Icon name="search" size={14}/>{s}</button>)}</div>}</div>
          <div><SelectField value={item.category} onChange={(v) => update(i,{category:v})}><option value="">Select category</option>{categoryOptions.map(c => <option key={c}>{c}</option>)}</SelectField></div>
          <div className="money-input"><span>₹</span><TextInput type="number" value={String(item.amount)} onChange={(v) => update(i,{amount:Number(v)})}/></div>
          <button className="icon-btn danger-icon" onClick={() => setItems(items.filter((_,index) => index !== i))}><Icon name="trash"/></button>
        </div>)}
      </div>
      <Button variant="secondary" icon="plus" onClick={() => setItems([...items,{product:"",amount:0,category:""}])}>Add Item</Button>
      <div className="recent-products"><span>Recently used</span>{["Milk","Bread","Tea","Tomato","Potato"].map(p => <button key={p} onClick={() => setItems([...items,{product:p,amount:0,category:""}])}><Icon name="plus" size={13}/>{p}</button>)}</div>
      <div className="total-box"><div><span>Subtotal</span><strong>₹{total}</strong></div><div className="grand-total"><span>Total Expense</span><strong>₹{total}</strong></div></div>
      <div className="form-actions"><Button variant="ghost" onClick={done}>Cancel</Button><Button icon="receipt" onClick={done}>Save Expense</Button></div>
    </Card>
  </div>;
}

function FilterBar() {
  return <Card className="filters"><div className="filter-title"><Icon name="filter"/><strong>Filters</strong></div><div className="filter-grid"><div><label>Date range</label><TextInput type="date" value="2026-09-01"/></div><div><label>Category</label><SelectField><option>All categories</option>{categoryOptions.map(c=><option key={c}>{c}</option>)}</SelectField></div><div><label>Product</label><TextInput placeholder="All products"/></div><div><label>Min amount</label><TextInput placeholder="₹ 0"/></div><div><label>Max amount</label><TextInput placeholder="₹ 10,000"/></div><Button>Apply Filters</Button></div></Card>;
}

function Expenses({ openDetail }: { openDetail: () => void }) {
  const [quick,setQuick] = useState("This Month");
  const rows = [
    ["26 Sep 2026","4 items","Dairy, Vegetables, Drinks","₹290"],
    ["25 Sep 2026","2 items","Food","₹450"],["24 Sep 2026","3 items","Travel","₹720"],
    ["23 Sep 2026","5 items","Grocery, Fruits","₹1,260"],["22 Sep 2026","2 items","Shopping","₹2,150"],
  ];
  return <div className="page">
    <div className="page-heading"><div><h1>All Expenses</h1><p>Track and manage your spending history.</p></div><Button icon="plus">Add Expense</Button></div>
    <div className="quick-row"><Segmented items={["Today","This Week","This Month","This Year"]} active={quick} setActive={setQuick}/><label className="search-field page-search"><Icon name="search"/><input placeholder="Search expenses"/></label></div>
    <FilterBar/>
    <Card className="data-card"><div className="card-head"><div><h2>Expense history</h2><p>24 entries in September</p></div><Button variant="secondary" icon="download">Export</Button></div>
      <div className="table-scroll"><table><thead><tr><th>Date</th><th>Items</th><th>Categories</th><th>Total Amount</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]} onClick={openDetail}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td><span className="badge">{r[2]}</span></td><td><strong>{r[3]}</strong></td><td><div className="row-actions"><button>View</button><button><Icon name="edit" size={15}/></button><button className="danger-text"><Icon name="trash" size={15}/></button></div></td></tr>)}</tbody></table></div>
    </Card>
  </div>;
}

function Categories() {
  const [modal,setModal] = useState(false);
  const cards = [["Dairy","42","₹4,850","D"],["Vegetables","28","₹4,250","V"],["Drinks","16","₹2,100","D"],["Food","35","₹7,850","F"],["Travel","12","₹3,850","T"],["Shopping","22","₹3,250","S"]];
  return <div className="page">
    <div className="page-heading"><div><h1>Categories</h1><p>Organize your expenses by category.</p></div><Button icon="plus" onClick={()=>setModal(true)}>Add Category</Button></div>
    <div className="category-grid">{cards.map(([name,count,spent,letter])=><Card className="manage-category" key={name}><div className="category-icon">{letter}</div><div className="category-copy"><h3>{name}</h3><p>{count} products</p><strong>{spent} <small>spent this month</small></strong></div><div className="category-actions"><button className="icon-btn"><Icon name="edit"/></button><button className="icon-btn danger-icon"><Icon name="trash"/></button></div></Card>)}</div>
    {modal && <Modal title="Add Category" close={()=>setModal(false)}><div className="field-group"><label>Category Name</label><TextInput placeholder="e.g. Personal Care"/></div><div className="field-group"><label>Description <small>Optional</small></label><textarea className="input textarea" placeholder="What expenses belong here?"/></div><div className="form-actions"><Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button><Button onClick={()=>setModal(false)}>Create Category</Button></div></Modal>}
  </div>;
}

function Products() {
  const [modal,setModal] = useState(false);
  const rows=[["Milk","Dairy","25 times","Today","₹1,850"],["Potato","Vegetables","18 times","Today","₹1,240"],["Tomato","Vegetables","15 times","Yesterday","₹850"],["Coffee","Drinks","12 times","Today","₹1,450"],["Bread","Grocery","20 times","2 days ago","₹1,600"]];
  return <div className="page"><div className="page-heading"><div><h1>Products</h1><p>Manage your saved products and autocomplete suggestions.</p></div><Button icon="plus" onClick={()=>setModal(true)}>Add Product</Button></div>
    <div className="quick-row product-toolbar"><label className="search-field page-search"><Icon name="search"/><input placeholder="Search products..."/></label><SelectField><option>All categories</option>{categoryOptions.map(c=><option key={c}>{c}</option>)}</SelectField></div>
    <Card className="data-card"><div className="card-head"><div><h2>Saved products</h2><p>127 products in your library</p></div></div><div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Times Used</th><th>Last Used</th><th>Total Spent</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td><span className="product-cell"><i>{r[0][0]}</i><strong>{r[0]}</strong></span></td><td><span className="badge">{r[1]}</span></td><td>{r[2]}</td><td>{r[3]}</td><td><strong>{r[4]}</strong></td><td><div className="row-actions"><button><Icon name="edit" size={15}/></button><button className="danger-text"><Icon name="trash" size={15}/></button></div></td></tr>)}</tbody></table></div></Card>
    {modal && <Modal title="Add Product" close={()=>setModal(false)}><div className="field-group"><label>Product name</label><TextInput placeholder="e.g. Paneer"/></div><div className="field-group"><label>Default category</label><SelectField><option>Select category</option>{categoryOptions.map(c=><option key={c}>{c}</option>)}</SelectField></div><div className="form-actions"><Button variant="ghost" onClick={()=>setModal(false)}>Cancel</Button><Button onClick={()=>setModal(false)}>Save Product</Button></div></Modal>}
  </div>;
}

function Reports() {
  const [range,setRange]=useState("Month");
  return <div className="page"><div className="page-heading"><div><h1>Reports & Analytics</h1><p>Understand where your money goes.</p></div><Segmented items={["Week","Month","Year","Custom Range"]} active={range} setActive={setRange}/></div>
    <div className="report-stats">{[["Total Spending","₹24,580","wallet"],["Average Daily","₹819","chart"],["Highest Spending Day","₹2,450","arrowUp"],["Most Used Category","Food","food"],["Top Product","Groceries","shopping"]].map(([l,v,i])=><Card key={l}><span className="stat-icon"><Icon name={i as IconName}/></span><span className="eyebrow">{l}</span><strong>{v}</strong></Card>)}</div>
    <div className="reports-grid">
      <Card className="report-wide"><div className="card-head"><div><h2>Daily Expense Trend</h2><p>September 2026</p></div><span className="trend up"><Icon name="arrowDown" size={12}/>3.2% lower</span></div><AreaChart/></Card>
      <Card><div className="card-head"><div><h2>Category Distribution</h2><p>This month</p></div></div><div className="donut-zone report-donut"><div className="donut"><div><strong>₹24.5k</strong><span>Total</span></div></div><div className="legend">{categories.slice(0,5).map(([n,a,p,c])=><div className="legend-row" key={n}><i className={`dot ${c}`}/><span>{n}</span><strong>{p}</strong></div>)}</div></div></Card>
      <Card><div className="card-head"><div><h2>Top Products by Spending</h2><p>Highest cost contributors</p></div></div>{[["Groceries","₹4,260","100%"],["Dining out","₹3,480","82%"],["Fuel","₹2,850","67%"],["Vegetables","₹2,240","53%"],["Coffee","₹1,450","34%"]].map(([n,a,w])=><div className="bar-row" key={n}><div><span>{n}</span><strong>{a}</strong></div><div className="bar"><i style={{width:w}}/></div></div>)}</Card>
      <Card className="report-wide"><div className="card-head"><div><h2>Monthly Expense Trend</h2><p>January — September 2026</p></div><strong>Avg ₹23,810</strong></div><div className="simple-bars">{[62,70,55,78,68,82,73,88,75].map((h,i)=><div key={i}><i style={{height:`${h}%`}}/><span>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"][i]}</span></div>)}</div></Card>
    </div>
  </div>;
}

function Modal({title,children,close}: {title:string;children:React.ReactNode;close:()=>void}) {
  return <div className="modal-layer"><div className="modal-scrim" onClick={close}/><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={close}><Icon name="close"/></button></div>{children}</div></div>;
}

function ExpenseDetail({close, edit}: {close:()=>void;edit:()=>void}) {
  const items=[["Milk","Dairy","₹60"],["Potato","Vegetables","₹80"],["Tomato","Vegetables","₹50"],["Cold Drink","Drinks","₹100"]];
  return <div className="modal-layer"><div className="modal-scrim" onClick={close}/><aside className="drawer"><div className="modal-head"><div><span className="eyebrow">Expense details</span><h2>26 September 2026</h2></div><button className="icon-btn" onClick={close}><Icon name="close"/></button></div><div className="detail-meta"><Icon name="calendar"/><span>Saturday</span><span className="badge">4 items</span></div><div className="detail-list">{items.map(([n,c,a])=><div key={n}><span className="product-cell"><i>{n[0]}</i><span><strong>{n}</strong><small>{c}</small></span></span><strong>{a}</strong></div>)}</div><div className="drawer-total"><span>Total Expense</span><strong>₹290</strong></div><div className="drawer-actions"><Button variant="secondary" icon="edit" onClick={edit}>Edit Expense</Button><Button variant="danger" icon="trash">Delete Expense</Button></div></aside></div>;
}

function SettingsPage() {
  return <div className="page narrow-page"><div className="page-heading"><div><h1>Settings</h1><p>Manage your preferences and profile.</p></div></div><Card><div className="settings-profile"><span className="avatar large">S</span><div><h2>Shivani</h2><p>Personal expense account</p></div><Button variant="secondary">Change photo</Button></div><div className="settings-form"><div className="field-group"><label>Full name</label><TextInput value="Shivani"/></div><div className="field-group"><label>Currency</label><SelectField><option>Indian Rupee (₹)</option></SelectField></div></div><div className="form-actions"><Button>Save Changes</Button></div></Card></div>;
}

export default function App() {
  const [page,setPage]=useState<Page>("dashboard");
  const [menu,setMenu]=useState(false);
  const [detail,setDetail]=useState(false);
  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} open={menu} close={()=>setMenu(false)}/>
    <main className="main"><Topbar page={page} setPage={setPage} menu={()=>setMenu(true)}/>
      {page==="dashboard" && <Dashboard setPage={setPage} openDetail={()=>setDetail(true)}/>}
      {page==="add" && <AddExpense done={()=>setPage("dashboard")}/>}
      {page==="expenses" && <Expenses openDetail={()=>setDetail(true)}/>}
      {page==="categories" && <Categories/>}{page==="products" && <Products/>}
      {page==="reports" && <Reports/>}{page==="settings" && <SettingsPage/>}
    </main>
    <button className="fab" onClick={()=>setPage("add")} aria-label="Add expense"><Icon name="plus" size={24}/></button>
    <nav className="bottom-nav">{navItems.slice(0,5).map(item=><button key={item.id} className={page===item.id?"active":""} onClick={()=>setPage(item.id)}><Icon name={item.icon}/><span>{item.label==="Add Expense"?"Add":item.label}</span></button>)}</nav>
    {detail && <ExpenseDetail close={()=>setDetail(false)} edit={()=>{setDetail(false);setPage("add");}}/>}
  </div>;
}
