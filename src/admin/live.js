import { API_BASE } from "../utils/api.js";

let es = null;

export function startLive() {
  if (es) return es;
  es = new EventSource(`${API_BASE}/api/updates/stream`);

  es.addEventListener("ping", () => {});

  es.addEventListener("order:new", (evt) => {
    let payload = null;
    try { payload = JSON.parse(evt.data); } catch {}
    console.log("📨 SSE order:new", payload);
    window.dispatchEvent(new CustomEvent("orders:changed", { detail: payload }));
    window.dispatchEvent(new CustomEvent("customers:changed", { detail: payload }));
    window.dispatchEvent(new CustomEvent("analytics:changed", { detail: payload }));
  });

  es.onerror = (err) => console.warn("SSE error", err);
  return es;
}


export function stopLive() {
  if (es) { es.close(); es = null; }
}
