import React from "react";
import { api } from "../utils/api.js";

export default function DashboardRevenueChart() {
  const [data, setData] = React.useState([]);
  const [err, setErr] = React.useState("");
  const height = 260;
  const padding = 28;
  const width = 640;

  const load = React.useCallback(async () => {
    try {
      setErr("");
      const json = await api(`/api/analytics?days=7&low=5`);
      const rows = (json?.salesByDay || []).map(d => ({ x: d._id, y: Number(d.revenue || 0) }));
      setData(rows);
    } catch (e) {
      setErr(e.message || "Failed to load revenue");
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    const onChange = () => setTimeout(load, 300);
    window.addEventListener("orders:changed", onChange);
    window.addEventListener("analytics:changed", onChange);
    const id = setInterval(load, 20000);
    return () => {
      window.removeEventListener("orders:changed", onChange);
      window.removeEventListener("analytics:changed", onChange);
      clearInterval(id);
    };
  }, [load]);

  if (err) {
    return <div className="grid place-items-center bg-red-50 rounded-2xl border text-red-700" style={{ height }}>{err}</div>;
  }
  if (!data.length) {
    return <div className="grid place-items-center bg-gray-100 rounded-2xl border text-gray-500" style={{ height }}>No data</div>;
  }

  const ys = data.map(d => d.y);
  const yMin = 0;
  const yMax = Math.max(...ys, 1);
  const xIdx = i => {
    const scale = (width - padding * 2) / Math.max(1, data.length - 1);
    return padding + i * scale;
  };
  const yScale = v => {
    const scale = (height - padding * 2) / Math.max(1e-9, yMax - yMin);
    return height - padding - (v - yMin) * scale;
  };

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xIdx(i)} ${yScale(d.y)}`).join(" ");
  const first = data[0]?.x;
  const last  = data[data.length - 1]?.x;
  const total = ys.reduce((a,b)=>a+b,0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">Revenue (last 7 days)</div>
        <div className="text-sm text-gray-600">Total: <span className="font-semibold">${total.toFixed(2)}</span></div>
      </div>
      <div className="overflow-x-auto bg-white rounded-2xl border p-3 shadow-sm">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e5e7eb" />
          <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e5e7eb" />
          {[0.25,0.5,0.75].map((t,i)=>(
            <line key={i} x1={padding} x2={width-padding} y1={yScale(yMax*t)} y2={yScale(yMax*t)} stroke="#f1f5f9" />
          ))}
          <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
          {data.map((d,i)=>(
            <circle key={i} cx={xIdx(i)} cy={yScale(d.y)} r="3" fill="#10b981" />
          ))}
          <text x={padding} y={height-6} fontSize="10" fill="#6b7280">{first}</text>
          <text x={width-padding} y={height-6} fontSize="10" textAnchor="end" fill="#6b7280">{last}</text>
          <text x={padding} y={padding-6} fontSize="10" fill="#6b7280">${yMax.toFixed(0)}</text>
        </svg>
      </div>
    </div>
  );
}
