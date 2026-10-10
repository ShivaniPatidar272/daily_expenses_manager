import { useMemo, useState } from "react";
import { AreaChart, Donut, Legend } from "../components/charts";
import { Button, Card, EmptyState, Icon, Segmented, TextInput, type IconName } from "../components/ui";
import { MONTHS_SHORT, WEEKDAYS_MON_FIRST, addDays, eachDay, endOfMonth, formatDate, isValidDateStr, previousRange, rangeFor, startOfMonth, startOfWeek, today, type DateRange, type RangeKind } from "../lib/dates";
import { sortExpenses } from "../lib/filters";
import { formatINR } from "../lib/format";
import { categorySlices, percentChange, sumInRange, totalsByDay, totalsByMonth } from "../lib/stats";
import { useStore } from "../store";
import type { Page } from "../lib/types";

const RANGES = ["Today", "This Week", "This Month", "This Year", "Custom"] as const;
const CHART_RANGES = ["Weekly", "Monthly", "Yearly"] as const;
type ChartRange = (typeof CHART_RANGES)[number];

function rangeNote(kind: RangeKind, r: DateRange): string {
  switch (kind) {
    case "Today": return "Today";
    case "This Week": return "This week";
    case "This Month": return "This month";
    case "This Year": return "This year";
    case "Custom": return `${formatDate(r.start)} – ${formatDate(r.end)}`;
  }
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Dashboard({ setPage, openDetail }: { setPage: (p: Page) => void; openDetail: (id: string) => void }) {
  const { data } = useStore();
  const t = today();
  const [range, setRange] = useState<RangeKind>("This Month");
  const [custom, setCustom] = useState<DateRange>({ start: startOfMonth(t), end: t });
  const [chartRange, setChartRange] = useState<ChartRange>("Weekly");
  const expenses = data.expenses;

  const stats = useMemo(() => {
    const kinds: { kind: RangeKind; label: string; icon: IconName; vs: string }[] = [
      { kind: "Today", label: "Today’s Expense", icon: "wallet", vs: "vs yesterday" },
      { kind: "This Week", label: "This Week", icon: "calendar", vs: "vs last week" },
      { kind: "This Month", label: "This Month", icon: "chart", vs: "vs last month" },
      { kind: "This Year", label: "This Year", icon: "receipt", vs: "Total spending" },
    ];
    return kinds.map((k) => {
      const cur = rangeFor(k.kind, t, custom);
      const amount = sumInRange(expenses, cur);
      const prev = previousRange(k.kind, cur, t);
      const change = prev ? percentChange(amount, sumInRange(expenses, prev)) : null;
      return { ...k, amount, change, note: k.vs };
    });
  }, [expenses, t, custom]);

  const chart = useMemo(() => {
    if (chartRange === "Weekly") {
      const days = eachDay(startOfWeek(t), addDays(startOfWeek(t), 6));
      return { sub: "Your spending pattern this week", values: totalsByDay(expenses, days), labels: [...WEEKDAYS_MON_FIRST], dots: true };
    }
    if (chartRange === "Monthly") {
      const days = eachDay(startOfMonth(t), endOfMonth(t));
      return { sub: "Your spending pattern this month", values: totalsByDay(expenses, days), labels: days.map((d) => String(Number(d.slice(8)))), dots: false };
    }
    return { sub: "Your spending pattern this year", values: totalsByMonth(expenses, t.slice(0, 4)), labels: [...MONTHS_SHORT], dots: true };
  }, [chartRange, expenses, t]);
  const chartTotal = chart.values.reduce((a, b) => a + b, 0);

  const activeRange = rangeFor(range, t, custom);
  const slices = useMemo(() => categorySlices(expenses, activeRange), [expenses, activeRange.start, activeRange.end]);
  const rangeTotal = sumInRange(expenses, activeRange);
  const topMax = Math.max(1, ...slices.map((s) => s.amount));

  const recent = useMemo(() => sortExpenses(expenses).slice(0, 5).flatMap((e) => e.items.map((i) => ({ e, i }))).slice(0, 5), [expenses]);

  const yearMonths = totalsByMonth(expenses, t.slice(0, 4));
  const monthMax = Math.max(1, ...yearMonths);

  return <div className="page">
    <div className="page-heading dashboard-heading">
      <div><h1>{greeting()}, {data.settings.name}</h1><p>Here’s your spending overview.</p></div>
      <Segmented items={RANGES} active={range} setActive={setRange}/>
    </div>
    {range === "Custom" && <div className="custom-range">
      <label>From<TextInput type="date" label="From date" value={custom.start} onChange={(v) => isValidDateStr(v) && setCustom({ ...custom, start: v })}/></label>
      <label>To<TextInput type="date" label="To date" value={custom.end} onChange={(v) => isValidDateStr(v) && setCustom({ ...custom, end: v })}/></label>
    </div>}
    <div className="stats-grid">
      {stats.map((s) => <Card key={s.label} className="stat-card">
        <div className="stat-top"><span className="stat-icon"><Icon name={s.icon}/></span></div>
        <span className="eyebrow">{s.label}</span><strong className="stat-value">{formatINR(s.amount)}</strong>
        <div className="stat-foot">{s.change !== null && <span className={`trend ${s.change > 0 ? "down" : "up"}`}><Icon name={s.change > 0 ? "arrowUp" : "arrowDown"} size={12}/>{s.change > 0 ? "+" : ""}{s.change}%</span>}<span>{s.note}</span></div>
      </Card>)}
    </div>
    <div className="dashboard-grid">
      <Card className="overview-card">
        <div className="card-head"><div><h2>Expense Overview</h2><p>{chart.sub}</p></div><div className="chart-head-right"><strong>Total: {formatINR(chartTotal)}</strong><Segmented items={CHART_RANGES} active={chartRange} setActive={setChartRange}/></div></div>
        <AreaChart points={chart.values.map((value, i) => ({ value, label: chart.labels[i] }))} showDots={chart.dots}/>
      </Card>
      <Card className="category-card">
        <div className="card-head"><div><h2>Spending by Category</h2><p>{rangeNote(range, activeRange)}</p></div></div>
        <div className="donut-zone">
          <Donut slices={slices} centerValue={formatINR(rangeTotal)}/>
          <Legend slices={slices}/>
        </div>
      </Card>
      <Card className="recent-card">
        <div className="card-head"><div><h2>Recent Expenses</h2><p>Your latest transactions</p></div><Button variant="secondary" onClick={() => setPage("expenses")}>View All Expenses <Icon name="chevron" size={14}/></Button></div>
        {recent.length === 0
          ? <EmptyState title="No expenses yet" text="Add your first expense to see it here." action={<Button icon="plus" onClick={() => setPage("add")}>Add Expense</Button>}/>
          : <div className="table-scroll"><table><thead><tr><th>Date</th><th>Product</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>{recent.map(({ e, i }) => <tr key={i.id} onClick={() => openDetail(e.id)}><td>{formatDate(e.date)}</td><td><span className="product-cell"><i>{i.product[0]?.toUpperCase()}</i>{i.product}</span></td><td>{i.category ? <span className="badge">{i.category}</span> : "—"}</td><td><strong>{formatINR(i.amount)}</strong></td></tr>)}</tbody></table></div>}
      </Card>
      <Card className="top-categories">
        <div className="card-head"><div><h2>Top Categories</h2><p>By total spending · {rangeNote(range, activeRange).toLowerCase()}</p></div></div>
        {slices.length === 0 ? <p className="muted-text">No spending in this period.</p> : slices.slice(0, 5).map((s) => <div className="bar-row" key={s.name}><div><span>{s.name}</span><strong>{formatINR(s.amount)}</strong></div><div className="bar"><i style={{ width: `${(s.amount / topMax) * 100}%` }}/></div></div>)}
      </Card>
      <Card className="monthly-card">
        <div className="card-head"><div><h2>Monthly Comparison</h2><p>Expenses by month, {t.slice(0, 4)}</p></div><div className="mini-legend"><span><i className="expense"/>Expenses</span></div></div>
        <div className="column-chart">{MONTHS_SHORT.map((m, i) => <div className="column" key={m} title={`${m}: ${formatINR(yearMonths[i])}`}><div><i className="expense" style={{ width: 16, height: `${yearMonths[i] > 0 ? Math.max(3, (yearMonths[i] / monthMax) * 100) : 0}%` }}/></div><span>{m}</span></div>)}</div>
      </Card>
    </div>
  </div>;
}

