// src/admin/CustomersPage.jsx
import React from "react";
import { api } from "../utils/api.js";

export default function CustomersPage() {
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [sort, setSort] = React.useState("orders");
  const [dir, setDir] = React.useState("desc");
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ q, sort, dir, page: String(page), limit: String(limit) }).toString();
      const data = await api(`/api/customers?${qs}`);
      setRows(Array.isArray(data?.items) ? data.items : []);
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [q, sort, dir, page, limit]);

 React.useEffect(() => { load(); }, [load]);

React.useEffect(() => {
  const onChange = () => {
    console.log("[Customers] orders/customers changed → refetching…");
    setTimeout(load, 300);
  };
  window.addEventListener("orders:changed", onChange);
  window.addEventListener("customers:changed", onChange);
  return () => {
    window.removeEventListener("orders:changed", onChange);
    window.removeEventListener("customers:changed", onChange);
  };
}, [load]);

React.useEffect(() => {
  const id = setInterval(load, 20000);
  return () => clearInterval(id);
}, [load]);


  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          className="px-3 py-2 rounded-xl border bg-white"
          placeholder="Search name or email"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ minWidth: 260 }}
        />
        <select className="px-3 py-2 rounded-xl border bg-white" value={sort} onChange={(e)=>setSort(e.target.value)}>
          <option value="orders">Sort: Orders</option>
          <option value="total">Sort: Total Spent</option>
          <option value="last">Sort: Last Order</option>
          <option value="name">Sort: Name</option>
          <option value="email">Sort: Email</option>
        </select>
        <select className="px-3 py-2 rounded-xl border bg-white" value={dir} onChange={(e)=>setDir(e.target.value)}>
          <option value="desc">↓ Desc</option>
          <option value="asc">↑ Asc</option>
        </select>
        <select className="ml-auto px-3 py-2 rounded-xl border bg-white" value={limit} onChange={(e)=>setLimit(Number(e.target.value))}>
          {[12,25,50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <Th>Customer</Th>
              <Th>Email</Th>
              <Th>Orders</Th>
              <Th>Total Spent</Th>
              <Th>Last Order</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><Td colSpan={6} className="py-10 text-center text-gray-500">Loading…</Td></tr>}
            {!loading && err && <tr><Td colSpan={6} className="py-10 text-center text-red-600">{err}</Td></tr>}
            {!loading && !err && rows.length === 0 && <tr><Td colSpan={6} className="py-10 text-center text-gray-500">No customers</Td></tr>}
            {!loading && !err && rows.map((c, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <Td className="font-medium">{c.name || "—"}</Td>
                <Td>{c.email || "—"}</Td>
                <Td>{c.orders ?? 0}</Td>
                <Td>${Number(c.totalSpent || 0).toFixed(2)}</Td>
                <Td>{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleString() : "—"}</Td>
                <Td><a className="px-2.5 py-1.5 rounded-lg border hover:bg-gray-50" href={`/admin/orders?q=${encodeURIComponent(c.email || "")}`}>View orders</a></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button className="px-3 py-2 rounded-xl border disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <div>Page {page}</div>
        <button className="px-3 py-2 rounded-xl border" onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left font-semibold px-4 py-3 text-gray-600 whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "", ...rest }) {
  return <td className={`px-4 py-2 align-middle whitespace-nowrap ${className}`} {...rest}>{children}</td>;
}
