import { useId } from "react";
import { formatCompactINR, formatINR } from "../lib/format";
import type { Slice } from "../lib/stats";

export type ChartPoint = { label: string; value: number };

const TOP = 10;
const BOTTOM = 218;

/** Picks a tidy axis maximum so the four grid steps are round numbers. */
function niceMax(max: number): number {
  if (!(max > 0)) return 100;
  const raw = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  return step * 4;
}

export function AreaChart({ points, showDots = true }: { points: ChartPoint[]; showDots?: boolean }) {
  const gradId = `area-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const n = Math.max(points.length, 1);
  const top = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const xs = points.map((_, i) => ((i + 0.5) / n) * 700);
  const ys = points.map((p) => BOTTOM - (p.value / top) * (BOTTOM - TOP));

  let line = "";
  ys.forEach((y, i) => {
    if (i === 0) line = `M${xs[0].toFixed(1)} ${y.toFixed(1)}`;
    else {
      const mid = (xs[i - 1] + xs[i]) / 2;
      line += ` C${mid.toFixed(1)} ${ys[i - 1].toFixed(1)} ${mid.toFixed(1)} ${y.toFixed(1)} ${xs[i].toFixed(1)} ${y.toFixed(1)}`;
    }
  });
  const area = points.length > 1 ? `${line} V${BOTTOM} H${xs[0].toFixed(1)} Z` : "";
  // For long series only label every few points so the axis stays readable.
  const every = points.length > 12 ? Math.ceil(points.length / 8) : 1;

  return <div className="chart-wrap">
    <div className="y-axis">{[4, 3, 2, 1, 0].map((k) => <span key={k}>{formatCompactINR((top / 4) * k)}</span>)}</div>
    <svg className="line-chart" viewBox="0 0 700 230" preserveAspectRatio="none" role="img" aria-label="Expense chart">
      <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity=".22"/><stop offset="100%" stopColor="var(--green)" stopOpacity="0"/></linearGradient></defs>
      <g className="grid-lines"><path d="M0 10H700M0 62H700M0 114H700M0 166H700M0 218H700"/></g>
      {area && <path className="area" style={{ fill: `url(#${gradId})` }} d={area}/>}
      {points.length > 1 && <path className="line" d={line}/>}
      {showDots && points.map((p, i) => <circle key={i} cx={xs[i]} cy={ys[i]} r="5"><title>{`${p.label}: ${formatINR(p.value)}`}</title></circle>)}
    </svg>
    <div className="x-axis" style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, textAlign: "center" }}>
      {points.map((p, i) => <span key={i}>{i % every === 0 ? p.label : ""}</span>)}
    </div>
  </div>;
}

/** Doughnut chart drawn with a CSS conic-gradient from the category slices. */
export function Donut({ slices, centerValue, centerLabel = "Total" }: { slices: Slice[]; centerValue: string; centerLabel?: string }) {
  const total = slices.reduce((s, x) => s + x.amount, 0);
  let background = "#eef2ef";
  if (total > 0) {
    let acc = 0;
    const stops = slices.map((s) => {
      const from = (acc / total) * 100;
      acc += s.amount;
      return `${s.color} ${from.toFixed(2)}% ${((acc / total) * 100).toFixed(2)}%`;
    });
    background = `conic-gradient(${stops.join(", ")})`;
  }
  return <div className="donut" style={{ background }} role="img" aria-label="Spending by category"><div><strong>{centerValue}</strong><span>{centerLabel}</span></div></div>;
}

export function Legend({ slices, showAmount = true }: { slices: Slice[]; showAmount?: boolean }) {
  const total = slices.reduce((s, x) => s + x.amount, 0);
  if (!slices.length) return <div className="legend"><div className="legend-empty">No spending in this period</div></div>;
  return <div className="legend">{slices.map((s) => <div className="legend-row" key={s.name}><i className="dot" style={{ background: s.color }}/><span>{s.name}</span>{showAmount && <strong>{formatINR(s.amount)}</strong>}<small>{total > 0 ? `${Math.round((s.amount / total) * 100)}%` : ""}</small></div>)}</div>;
}
