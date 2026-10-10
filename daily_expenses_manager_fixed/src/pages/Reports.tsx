import { useMemo, useState, type ReactNode } from "react";
import { AreaChart, Donut, Legend } from "../components/charts";
import { Card, EmptyState, Icon, Segmented, TextInput, type IconName } from "../components/ui";
import { MONTHS_SHORT, daysBetween, eachDay, endOfMonth, formatDate, isValidDateStr, parseDate, periodLabel, previousRange, rangeFor, startOfMonth, today, addMonths, type DateRange, type RangeKind } from "../lib/dates";
import { formatINR, round2 } from "../lib/format";
import { UNCATEGORIZED, categorySlices, expenseTotal, inRange, percentChange, productStats, sumInRange, totalsByDay, totalsByMonth } from "../lib/stats";
import { useStore } from "../store";

const ITEMS = ["Week", "Month", "Year", "Custom Range"] as const;
type Item = (typeof ITEMS)[number];
const KIND: Record<Item, RangeKind> = { Week: "This Week", Month: "This Month", Year: "This Year", "Custom Range": "Custom" };

export default function Reports() {
  const { data } = useStore();
  const t = today();
  const [item, setItem] = useState<Item>("Month");
  const [custom, setCustom] = useState<DateRange>({ start: startOfMonth(t), end: t });
  const kind = KIND[item];
  const range = rangeFor(kind, t, custom);
  const expenses = data.expenses;

  const r = useMemo(() => {
    const total = sumInRange(expenses, range);
    const effectiveEnd = range.end > t ? t : range.end;
    const days = Math.max(1, effectiveEnd >= range.start ? daysBetween(range.start, effectiveEnd) : 1);

    const perDay = new Map<string, number>();
    for (const e of expenses) if (inRange(e.date, range)) perDay.set(e.date, (perDay.get(e.date) ?? 0) + expenseTotal(e));
    let topDay: { date: string; amount: number } | null = null;
    for (const [date, amount] of perDay) if (!topDay || amount > topDay.amount) topDay = { date, amount: round2(amount) };

    const slices = categorySlices(expenses, range, 5);
    const prods = [...productStats(expenses, range).values()].sort((a, b) => b.amount - a.amount);

    const dailyLen = daysBetween(range.start, range.end);
    let points: { label: string; value: number }[];
    if (dailyLen <= 62) {
      const ds = eachDay(range.start, range.end);
      const vals = totalsByDay(expenses, ds);
      points = ds.map((d, i) => ({ label: dailyLen <= 7 ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseDate(d).getDay()] : String(Number(d.slice(8))), value: vals[i] }));
    } else {
      points = [];
      const crossYear = range.start.slice(0, 4) !== range.end.slice(0, 4);
      for (let m = startOfMonth(range.start); m <= range.end; m = addMonths(m, 1)) {
        const mEnd = endOfMonth(m);
        const bounded = { start: m < range.start ? range.start : m, end: mEnd > range.end ? range.end : mEnd };
        points.push({ label: `${MONTHS_SHORT[Number(m.slice(5, 7)) - 1]}${crossYear ? ` ${m.slice(2, 4)}` : ""}`, value: sumInRange(expenses, bounded) });
      }
    }

    const prev = previousRange(kind, range, t);
    const change = prev ? percentChange(total, sumInRange(expenses, prev)) : null;
    return { total, days, topDay, slices, prods, points, change };
  }, [expenses, range.start, range.end, kind, t]);

  const year = t.slice(0, 4);
  const months = totalsByMonth(expenses, year);
  const monthMax = Math.max(1, ...months);
  const monthsElapsed = Number(t.slice(5, 7));
  const monthAvg = round2(months.slice(0, monthsElapsed).reduce((a, b) => a + b, 0) / monthsElapsed);
  const prodMax = Math.max(1, ...r.prods.map((p) => p.amount));

  const cards: [string, ReactNode, IconName][] = [
    ["Total Spending", formatINR(r.total), "wallet"],
    ["Average Daily", formatINR(r.total / r.days), "chart"],
    ["Highest Spending Day", r.topDay ? <>{formatINR(r.topDay.amount)}<small className="stat-sub">{formatDate(r.topDay.date)}</small></> : "—", "arrowUp"],
    ["Most Used Category", r.slices.find((x) => x.name !== "Others" && x.name !== UNCATEGORIZED)?.name ?? "—", "food"],
    ["Top Product", r.prods[0]?.name ?? "—", "shopping"],
  ];

  return <div className="page"><div className="page-heading"><div><h1>Reports & Analytics</h1><p>Understand where your money goes.</p></div><Segmented items={ITEMS} active={item} setActive={setItem}/></div>
    {kind === "Custom" && <div className="custom-range">
      <label>From<TextInput type="date" label="From date" value={custom.start} onChange={(v) => isValidDateStr(v) && setCustom({ ...custom, start: v })}/></label>
      <label>To<TextInput type="date" label="To date" value={custom.end} onChange={(v) => isValidDateStr(v) && setCustom({ ...custom, end: v })}/></label>
    </div>}
    <div className="report-stats">{cards.map(([l, v, i]) => <Card key={l}><span className="stat-icon"><Icon name={i}/></span><span className="eyebrow">{l}</span><strong>{v}</strong></Card>)}</div>
    {expenses.length === 0 && <Card className="report-empty"><EmptyState title="No data to report yet" text="Charts will fill in as soon as you add expenses."/></Card>}
    <div className="reports-grid">
      <Card className="report-wide"><div className="card-head"><div><h2>{r.points.length > 0 && daysBetween(range.start, range.end) <= 62 ? "Daily Expense Trend" : "Monthly Trend in Range"}</h2><p>{periodLabel(kind, range)}</p></div>{r.change !== null && <span className={`trend ${r.change > 0 ? "down" : "up"}`}><Icon name={r.change > 0 ? "arrowUp" : "arrowDown"} size={12}/>{Math.abs(r.change)}% {r.change > 0 ? "higher" : "lower"} than previous period</span>}</div><AreaChart points={r.points} showDots={r.points.length <= 12}/></Card>
      <Card><div className="card-head"><div><h2>Category Distribution</h2><p>{periodLabel(kind, range)}</p></div></div><div className="donut-zone report-donut"><Donut slices={r.slices} centerValue={formatINR(r.total)}/><Legend slices={r.slices} showAmount={false}/></div></Card>
      <Card><div className="card-head"><div><h2>Top Products by Spending</h2><p>Highest cost contributors</p></div></div>{r.prods.length === 0 ? <p className="muted-text">No spending in this period.</p> : r.prods.slice(0, 5).map((p) => <div className="bar-row" key={p.name}><div><span>{p.name}</span><strong>{formatINR(p.amount)}</strong></div><div className="bar"><i style={{ width: `${(p.amount / prodMax) * 100}%` }}/></div></div>)}</Card>
      <Card className="report-wide"><div className="card-head"><div><h2>Monthly Expense Trend</h2><p>January — December {year}</p></div><strong>Avg {formatINR(monthAvg)}</strong></div><div className="simple-bars">{months.map((v, i) => <div key={i} title={`${MONTHS_SHORT[i]}: ${formatINR(v)}`}><i style={{ height: `${v > 0 ? Math.max(2, (v / monthMax) * 100) : 0}%` }}/><span>{MONTHS_SHORT[i]}</span></div>)}</div></Card>
    </div>
  </div>;
}
