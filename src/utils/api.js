// src/utils/api.js
 export const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.location.port === "3000" ? "http://localhost:5000" : "");


export async function api(path, opts = {}) {
  const token =
    localStorage.getItem("admintoken") || localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  // Auto-logout on 401
  if (res.status === 401) {
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminuser");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Request failed: ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function createOrder(payload) {
  return api("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

