// src/admin/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "";

async function api(path, opts = {}) {
  const token = localStorage.getItem("admintoken");
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();


  const q = params.get("q") || "";
  const status = params.get("status") || "all";
  const sort = params.get("sort") || "created";
  const dir = params.get("dir") || "desc";
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 12);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const query = new URLSearchParams({
          q, status, sort, dir, page: String(page), limit: String(limit),
        }).toString();
        const data = await api(`/api/orders?${query}`);
        const items = Array.isArray(data) ? data : (data.items || []);
        if (!ignore) setRows(items);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load orders");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [q, status, sort, dir, page, limit]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  }
React.useEffect(() => {
   function onChange() {
     setTimeout(() => {
       window.location.reload(); 
     }, 400);
   }
   window.addEventListener("orders:changed", onChange);
   return () => window.removeEventListener("orders:changed", onChange);
 }, []);
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => updateParam("q", e.target.value)}
          placeholder="Search email, name or order #"
          className="px-3 py-2 rounded-xl border bg-white"
          style={{ minWidth: 260 }}
        />
        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="px-3 py-2 rounded-xl border bg-white"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="px-3 py-2 rounded-xl border bg-white"
        >
          <option value="created">Sort: Created</option>
          <option value="total">Sort: Total</option>
          <option value="status">Sort: Status</option>
        </select>
        <select
          value={dir}
          onChange={(e) => updateParam("dir", e.target.value)}
          className="px-3 py-2 rounded-xl border bg-white"
        >
          <option value="desc">↓ Desc</option>
          <option value="asc">↑ Asc</option>
        </select>
        <select
          value={limit}
          onChange={(e) => updateParam("limit", e.target.value)}
          className="ml-auto px-3 py-2 rounded-xl border bg-white"
        >
          {[12, 25, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Total</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><Td colSpan={7} className="py-10 text-center text-gray-500">Loading…</Td></tr>
            )}
            {!loading && err && (
              <tr><Td colSpan={7} className="py-10 text-center text-red-600">{err}</Td></tr>
            )}
            {!loading && !err && rows.length === 0 && (
              <tr><Td colSpan={7} className="py-10 text-center text-gray-500">No orders</Td></tr>
            )}
            {!loading && !err && rows.map((o) => (
              <tr key={o._id || o.id} className="border-b last:border-0 hover:bg-gray-50">
                <Td className="font-medium">#{o.number || (o._id || "").slice(-6)}</Td>
                <Td>{o.customer?.name || o.customerName || "—"}</Td>
                <Td>{new Date(o.createdAt || o.date || Date.now()).toLocaleString()}</Td>
                <Td>${Number(o.total || 0).toFixed(2)}</Td>
                <Td>{o.paymentStatus || "—"}</Td>
                <Td>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                    (o.status || "").toLowerCase() === "fulfilled"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}>
                    {o.status || "—"}
                  </span>
                </Td>
                <Td>
                  <Link
                    to={`/admin/orders/${o._id || o.id}`}
                    className="px-2.5 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    View
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pager (simple) */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          className="px-3 py-2 rounded-xl border disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => updateParam("page", page - 1)}
        >
          ← Prev
        </button>
        <div>Page {page}</div>
        <button
          className="px-3 py-2 rounded-xl border"
          onClick={() => updateParam("page", page + 1)}
        >
          Next →
        </button>
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
