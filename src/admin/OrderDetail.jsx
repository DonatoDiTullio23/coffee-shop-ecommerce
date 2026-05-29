// src/admin/OrderDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

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

/* ---------- helpers ---------- */

const toNum = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};
const cents = (v) => Math.round(toNum(v, 0)) / 100;

function pick(arr, ...keys) {
  for (const k of keys) {
    const v = arr.reduce((acc, obj) => (acc != null ? acc : obj?.[k]), undefined);
    if (v != null) return v;
  }
  return undefined;
}

function normalizeItems(order) {
  const src =
    Array.isArray(order?.items) ? order.items :
    Array.isArray(order?.lineItems) ? order.lineItems :
    Array.isArray(order?.cart) ? order.cart :
    [];

  return src.map((row) => {
    const price =
      row.price != null ? toNum(row.price) :
      row.unit_amount != null ? cents(row.unit_amount) :
      row.price_data?.unit_amount != null ? cents(row.price_data.unit_amount) :
      0;

    const qty = toNum(row.quantity ?? row.qty ?? 1, 1);

    const name = row.name ?? row.title ?? row.product?.name ?? "Item";
    const image = row.image ?? row.images?.[0] ?? row.product?.image ?? "";

    return { name, image, price, quantity: qty, _raw: row };
  });
}

function computeTotals(order) {
  const items = normalizeItems(order);
  const subtotal = items.reduce((s, it) => s + toNum(it.price) * toNum(it.quantity, 1), 0);

  const tax =
    pick(
      [order, order?.pricing, order?.totals],
      "tax",
      "tax_total",
      "taxes_total"
    ) ??
    (Array.isArray(order?.taxes)
      ? order.taxes.reduce((s, t) => s + (t?.amount_total ? cents(t.amount_total) : 0), 0)
      : undefined);

  const shipping =
    pick(
      [order, order?.pricing, order?.totals],
      "shipping",
      "shipping_total"
    ) ??
    (order?.shipping_cost?.amount_total != null
      ? cents(order.shipping_cost.amount_total)
      : undefined);

  const taxN = toNum(tax, 0);
  const shipN = toNum(shipping, 0);
  const total =
    pick([order, order?.pricing, order?.totals], "total", "amount_total") ??
    (order?.amount_total != null ? cents(order.amount_total) : undefined) ??
    (subtotal + taxN + shipN);

  return {
    items,
    subtotal,
    tax: taxN,
    shipping: shipN,
    total: toNum(total, subtotal + taxN + shipN),
  };
}

function fmt(n) {
  return `$${toNum(n, 0).toFixed(2)}`;
}

function statusBadge(s) {
  const val = (s || "").toLowerCase();
  const cls =
    val === "fulfilled"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : val === "cancelled"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>{s || "—"}</span>;
}

/* ---------- page ---------- */

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api(`/api/orders/${id}`);
        if (!ignore) setOrder(data?.order ?? data);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load order");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [id]);

  const {
    items,
    subtotal,
    tax,
    shipping,
    total,
  } = useMemo(() => computeTotals(order || {}), [order]);

  const number =
    order?.number ||
    (order?._id ? order._id.toString().slice(-6).toUpperCase() : "—");

  const payment =
    order?.paymentStatus ||
    order?.payment_status ||
    order?.payment?.status ||
    "—";

  const status = order?.status || "new";

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }
  if (err) {
    return (
      <div className="p-6 text-red-600">
        {err}{" "}
        <button className="underline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="p-6">
        Not found. <Link to="/admin/orders" className="text-emerald-600 underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Order #{number}</h1>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <section className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="divide-y">
            {items.map((it, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={it.image || "/placeholder.png"}
                    alt=""
                    className="w-12 h-12 rounded object-cover border"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <div className="truncate">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-xs text-gray-500">x{it.quantity}</div>
                  </div>
                </div>
                <div className="font-medium whitespace-nowrap">{fmt(it.price * it.quantity)}</div>
              </div>
            ))}
            {items.length === 0 && <div className="py-8 text-gray-500 text-center">No items</div>}
          </div>
        </section>

        {/* Summary */}
        <section className="bg-white rounded-2xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Items</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{fmt(tax)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{fmt(shipping)}</span></div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-600 mb-1">Payment</div>
            {statusBadge(payment)}
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-600 mb-1">Status</div>
            {statusBadge(status)}
          </div>
        </section>
      </div>

      {/* Customer & Shipping */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-3">Customer</h3>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Name</span> <div>{order?.customer?.name || "—"}</div></div>
            <div><span className="text-gray-500">Email</span> <div>{order?.customer?.email || "—"}</div></div>
            <div><span className="text-gray-500">Phone</span> <div>{order?.customer?.phone || "—"}</div></div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5 shadow-sm">
          <h3 className="font-semibold mb-3">Shipping</h3>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {order?.shippingAddress
              ? [
                  order.shippingAddress.address,
                  order.shippingAddress.city,
                  order.shippingAddress.postalCode,
                  order.shippingAddress.country,
                ].filter(Boolean).join("\n")
              : "—"}
          </div>
        </section>
      </div>
    </div>
  );
}
