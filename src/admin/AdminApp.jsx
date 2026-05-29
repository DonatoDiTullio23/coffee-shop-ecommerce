import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm.jsx";
import OrdersPage from "./OrdersPage.jsx";
import OrderDetail from "./OrderDetail.jsx";
import CustomersPage from "./CustomersPage.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import { startLive } from "./live.js";
import DashboardRevenueChart from "./DashboardRevenueChart.jsx";
/* ---------- Utils ---------- */

const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(p) {
  const src = p && typeof p === "object" ? (p._doc || p) : {};
  return {
    _id: p?._id || p?.id || src?._id || src?.id || "",
    name: src?.name ?? "",
    price: toNumber(src?.price, 0),
    stock: toNumber(src?.stock ?? src?.quantity ?? src?.inventory ?? src?.inStock, 0),
    category: src?.category ?? "",
    image: src?.image ?? "",
    description: src?.description ?? "",
  };
}

async function fetchMe() {
  try {
    const data = await api("/api/auth/me");
    localStorage.setItem("adminuser", JSON.stringify(data.user));
    return data.user;
  } catch {
    return null;
  }
}

async function api(path, opts = {}) {
  const token = localStorage.getItem("admintoken");
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminuser");
    if (window.location.pathname !== "/login") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ---------- Layout ---------- */

function Shell({ children, title = "Dashboard" }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar title={title} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Topbar({ title }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminuser") || "null"); } catch { return null; }
  });

  useEffect(() => { if (!user) fetchMe().then(setUser); }, []); 

  function logout() {
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminuser");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">{user?.name || user?.email || "Admin"}</div>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/products?q=${encodeURIComponent(q)}`)}
              placeholder="Search products…"
              className="pl-10 pr-3 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔎</span>
          </div>
          <button onClick={logout} className="px-3 py-2 rounded-xl border hover:bg-gray-50">Log out</button>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-white min-h-screen p-4">
      <div className="mb-6">
        <Link to="/admin" className="text-2xl font-black tracking-tight">☕ Coffee Admin</Link>
        <p className="text-xs text-gray-500 mt-1">Manage products, orders, and more</p>
      </div>
      <nav className="space-y-1">
        <NavLink to="/admin" label="Dashboard" />
        <NavLink to="/admin/products" label="Products" />
        <NavLink to="/admin/orders" label="Orders" />
        <NavLink to="/admin/customers" label="Customers" />
        <NavLink to="/admin/analytics" label="Analytics" />
        <NavLink to="/admin/settings" label="Settings" />
      </nav>
    </aside>
  );
}

function NavLink({ to, label }) {
  const active = window.location.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-4 py-2.5 rounded-xl transition ${
        active ? "bg-emerald-100 text-emerald-800" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      {label}
    </Link>
  );
}

/* ---------- Auth ---------- */

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("admintoken"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminuser") || "null"); } catch { return null; }
  });

  const login = (tkn, usr) => {
    localStorage.setItem("admintoken", tkn || "dev-demo-token");
    setToken(tkn || "dev-demo-token");
    if (usr) {
      localStorage.setItem("adminuser", JSON.stringify(usr));
      setUser(usr);
    }
  };
  const logout = () => {
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminuser");
    setToken(null);
    setUser(null);
  };
  return { token, user, login, logout };
}

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("admintoken");
  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length) {
    let role = null;
    try { role = (JSON.parse(localStorage.getItem("adminuser") || "null") || {}).role; } catch {}
    if (!roles.includes(role)) return <Navigate to="/admin" replace />;
  }
  return children;
}

/* ---------- Pages ---------- */

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@coffee.local");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const token = data.token || "dev-demo-token";
      const user = data.user || { email, role: "admin" };
      auth.login(token, user);
      navigate("/admin");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-emerald-50 to-white">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm border">
        <h2 className="text-2xl font-bold mb-1">Admin Login</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to access the dashboard</p>
        {error && <div className="mb-3 text-sm p-2 rounded-lg border border-red-200 bg-red-50 text-red-700">{error}</div>}
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 mb-3 w-full border rounded-xl px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <label className="block text-sm font-medium">Password</label>
        <input className="mt-1 mb-6 w-full border rounded-xl px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    let ignore = false;
    (async () => {
      await new Promise((r) => r());
      if (!ignore) {
        setMetrics({ revenueToday: 482.91, ordersToday: 17, topProduct: "Ethiopia Yirgacheffe", inventoryLow: 3 });
      }
    })();
    return () => (ignore = true);
  }, []);

  return (
    <Shell title="Dashboard">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Revenue (today)" value={`$${metrics?.revenueToday ?? "—"}`} />
        <StatCard label="Orders (today)" value={metrics?.ordersToday ?? "—"} />
        <StatCard label="Top Product" value={metrics?.topProduct ?? "—"} />
        <StatCard label="Low Inventory" value={metrics?.inventoryLow ?? "—"} />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Panel title="Sales (7 days)">
          <DashboardRevenueChart />
        </Panel>

        <Panel title="Best Sellers">
          <ul className="text-sm space-y-2">
            <li>1. Ethiopia Yirgacheffe</li>
            <li>2. Guatemala Huehuetenango</li>
            <li>3. House Espresso</li>
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}



function ProductsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      setBusyId(id);
      await api(`/api/products/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const data = await api(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        const items = Array.isArray(data) ? data : [];
        if (!ignore) setRows(items);
      } catch (e) {
        if (!ignore) setError(e.message || "Failed to load products");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [q]);

  return (
    <Shell title="Products">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/admin/products/new")} className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            + New Product
          </button>
          <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
            Refresh
          </button>
        </div>
        <span className="text-sm text-gray-500">{rows.length} items</span>
      </div>

      {loading && <SkeletonTable />}
      {error && <div className="p-4 rounded-xl border bg-red-50 text-red-700">{error}</div>}
      {!loading && !error && <DataTable rows={rows} onDelete={handleDelete} busyId={busyId} />}
    </Shell>
  );
}


function SettingsPage() {
  return (
    <Shell title="Settings">
      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Store">
          <div className="space-y-3 text-sm">
            <Labeled label="Store name"><input className="w-full border rounded-xl px-3 py-2" defaultValue="Coffee Co." /></Labeled>
            <Labeled label="Currency"><input className="w-full border rounded-xl px-3 py-2" defaultValue="CAD" /></Labeled>
            <Labeled label="Support email"><input className="w-full border rounded-xl px-3 py-2" defaultValue="support@example.com" /></Labeled>
            <div className="pt-2"><button className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Save</button></div>
          </div>
        </Panel>
        <Panel title="Danger zone">
          <button className="px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">Reset demo data</button>
        </Panel>
      </div>
    </Shell>
  );
}

/* ---------- UI Bits ---------- */

function Panel({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border p-5 shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Placeholder({ height = 200, children }) {
  return <div className="grid place-items-center bg-gray-100 rounded-2xl border" style={{ height }}>{children}</div>;
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
      {[...Array(6)].map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded my-2" />)}
    </div>
  );
}

function DataTable({ rows = [], onDelete, busyId }) {
  const navigate = useNavigate();
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {safeRows.map((raw) => {
            const p = normalizeProduct(raw);
            return (
              <tr key={p._id || Math.random()} className="border-b last:border-0 hover:bg-gray-50">
                <Td className="font-medium flex items-center gap-3 py-3">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt=""
                    className="w-10 h-10 rounded object-cover border"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <div>
                    <div>{p.name || "—"}</div>
                    <div className="text-gray-500 text-xs">{p.category || "—"}</div>
                  </div>
                </Td>
                <Td>${Number(p.price || 0).toFixed(2)}</Td>
                <Td>{p.stock}</Td>
                <Td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      p.stock > 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {p.stock > 0 ? "Active" : "Out"}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      className="px-2.5 py-1.5 rounded-lg border hover:bg-gray-50"
                      onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={busyId === p._id}
                      className="px-2.5 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => onDelete?.(p._id)}
                    >
                      {busyId === p._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
          {safeRows.length === 0 && (
            <tr>
              <Td colSpan={5} className="text-center py-10 text-gray-500">No products found</Td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left font-semibold px-4 py-3 text-gray-600">{children}</th>;
}
function Td({ children, className = "", ...rest }) {
  return <td className={`px-4 py-2 align-middle ${className}`} {...rest}>{children}</td>;
}

/* ---------- App ---------- */

function AdminRouter() {
  React.useEffect(() => { startLive(); }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="admin" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="orders"
                element={
                  <Shell title="Orders">
                    <OrdersPage />
                  </Shell>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <Shell title="Order Detail">
                    <OrderDetail />
                  </Shell>
                }
              />
              <Route
                path="customers"
                element={
                  <Shell title="Customers">
                    <CustomersPage />
                  </Shell>
                }
              />
              <Route
                path="analytics"
                element={
                  <Shell title="Analytics">
                    <AnalyticsPage />
                  </Shell>
                }
              />

              {/* Product create/edit */}
              <Route
                path="products/new"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Shell title="New Product">
                      <ProductForm />
                    </Shell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="products/:id/edit"
                element={
                  <ProtectedRoute roles={["admin", "manager"]}>
                    <Shell title="Edit Product">
                      <ProductForm />
                    </Shell>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


export default function AdminApp() {
  React.useEffect(() => {
    const es = startLive();
    console.log("🔌 SSE connected:", es?.url);
  }, []);
  return <AdminRouter />;
}
