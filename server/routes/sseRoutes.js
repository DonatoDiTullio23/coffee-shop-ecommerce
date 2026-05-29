// server/routes/sseRoutes.js
import express from "express";
import bus from "../events.js";

const router = express.Router();

console.log("✅ sseRoutes loaded");

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const ping = setInterval(() => send("ping", { t: Date.now() }), 15000);

  const handler = (payload) => send("order:new", payload);
  bus.on("order:new", handler);

  req.on("close", () => {
    clearInterval(ping);
    bus.off("order:new", handler);
  });
});

router.get("/test", (req, res) => {
  const payload = { id: Date.now(), test: true };
  console.log("🔔 Emitting test order:new", payload);
  bus.emit("order:new", payload);
  res.json({ ok: true, sent: payload });
});

export default router;
