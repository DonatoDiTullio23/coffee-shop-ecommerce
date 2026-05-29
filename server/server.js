// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sseRoutes from "./routes/sseRoutes.js";

console.log("📦 customerRoutes import type:", typeof customerRoutes);

// --- load env from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const {
  PORT = 5000,
  MONGO_URI,
  JWT_SECRET,
  CLIENT_URL = "http://localhost:3000",
  STRIPE_SECRET_KEY,
} = process.env;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in server/.env");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in server/.env");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    if (!req.originalUrl.includes("/analytics"))
      console.log(`🌍 ${req.method} ${req.originalUrl}`);
    next();
  });
}


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/updates", sseRoutes);
console.log("✅ customers route mounted at /api/customers");


app.use("/api/customers", customerRoutes);  


app.get("/health", (_req, res) => res.json({ ok: true }));

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { items, email } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const lineItems = items.map((i) => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name, images: i.image ? [i.image] : [] },
        unit_amount: Math.round(Number(i.price || 0) * 100),
      },
      quantity: Number(i.quantity || 1),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      success_url: `${CLIENT_URL}/order-confirmation?status=success`,
      cancel_url: `${CLIENT_URL}/order-confirmation?status=cancel`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});



mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    
    app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });
