// src/admin/AnalyticsPage.jsx
import React from "react";
import { api } from "../utils/api.js";

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}

function MiniTable({ title, cols = [], rows = [] }) {
  return (
    <section className="bg-white rounded-2xl border p-5 shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{cols.map((c) => <th key={c} className="text-left font-semibold px-3 py-2 text-gray-600">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={cols.length}>No data</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                {Object.values(r).map((v, j) => <td key={j} className="px-3 py-2">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LineChart({ data = [], height = 220, padding = 28 }) {
  if (!data.length) {
    return (
      <div className="grid place-items-center bg-gray-100 rounded-2xl border" style={{ height }}>
        <span className="text-gray-500">No chart data</span>
      </div>
    );
  }
  const w = 640, h = height;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const xIdx = (i) => {
    const minX = 0, maxX = data.length - 1;
    const scale = (w - padding * 2) / Math.max(1, maxX - minX);
    return padding + (i - minX) * scale;
  };
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 1);
  const yScale = (val) => {
    const scale = (h - padding * 2) / Math.max(1e-9, yMax - yMin);
    return h - padding - (val - yMin) * scale;
  };
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xIdx(i)} ${yScale(d.y)}`).join(" ");
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <div className="text-sm font-semibold mb-3">Revenue (last {data.length} days)</div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <line x1={padding} y1={h-padding} x2={w-padding} y2={h-padding} stroke="#e5e7eb" />
          <line x1={padding} y1={padding} x2={padding} y2={h-padding} stroke="#e5e7eb" />
          <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
          {data.map((d, i) => <circle key={i} cx={xIdx(i)} cy={yScale(d.y)} r="3" fill="#10b981" />)}
        </svg>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Range: {xs[0]} → {xs[xs.length - 1]}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [data, setData] = React.useState(null);

  const [days, setDays] = React.useState(30);
  const [low, setLow] = React.useState(5);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
    console.log("[Analytics] GET /api/analytics …");
      const params = new URLSearchParams({ days: String(days), low: String(low) }).toString();
      const json = await api(`/api/analytics?${params}`);
      setData(json);
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, low]);

React.useEffect(() => { load(); }, [load]);

// refetch when a new order arrives
React.useEffect(() => {
  const onChange = () => {
    console.log("[Analytics] orders/analytics changed → refetching…");
    setTimeout(load, 300);
  };
  window.addEventListener("orders:changed", onChange);
  window.addEventListener("analytics:changed", onChange);
  return () => {
    window.removeEventListener("orders:changed", onChange);
    window.removeEventListener("analytics:changed", onChange);
  };
}, [load]);

// POLL fallback every 20s 
React.useEffect(() => {
  const id = setInterval(load, 20000);
  return () => clearInterval(id);
}, [load]);

  if (loading) return <div className="grid place-items-center bg-gray-100 rounded-2xl border h-60">Loading…</div>;
  if (err) return <div className="p-4 rounded-2xl border bg-red-50 text-red-700">{err}</div>;

  const k = data?.kpis || {};
  const chartData = (data?.salesByDay || []).map(d => ({ x: d._id, y: Number(d.revenue || 0) }));

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <label className="text-sm text-gray-600">Range</label>
        <select className="px-3 py-2 rounded-xl border bg-white" value={days} onChange={e=>setDays(Number(e.target.value))}>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
        <label className="text-sm text-gray-600 ml-4">Low stock ≤</label>
        <select className="px-3 py-2 rounded-xl border bg-white" value={low} onChange={e=>setLow(Number(e.target.value))}>
          {[0,1,2,3,5,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Revenue (range)" value={`$${(k.revenueTotal || 0).toFixed(2)}`} />
        <Stat label="Orders (range)" value={k.ordersTotal || 0} />
        <Stat label="Avg Order Value" value={`$${(k.avgOrderValue || 0).toFixed(2)}`} />
        <Stat label="Range" value={`${data?.range?.days || 30} days`} />
      </div>

      <LineChart data={chartData} />

      <div className="grid lg:grid-cols-2 gap-6">
        <MiniTable
          title="Top Products"
          cols={["Product", "Qty", "Revenue"]}
          rows={(data?.topProducts || []).map(p => ({
            Product: p.name || "—",
            Qty: p.qty ?? 0,
            Revenue: `$${Number(p.revenue || 0).toFixed(2)}`,
          }))}
        />
        <MiniTable
          title="Low Inventory"
          cols={["Product", "Stock", "Category"]}
          rows={(data?.lowInventory || []).map(p => ({
            Product: p.name || "—",
            Stock: p.stock ?? 0,
            Category: p.category || "—",
          }))}
        />
      </div>
    </div>
  );
}
