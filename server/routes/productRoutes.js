// server/routes/productRoutes.js
import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Product from "../models/Product.js";

console.log("📦 productRoutes import:");
const router = express.Router();
console.log("✅ productRoutes file loaded");

router.get("/test", (_req, res) => {
  console.log("📡 GET /api/products/test");
  res.send("✅ Product routes are working");
});

/* ---------------- READ ALL ---------------- */
router.get("/", async (req, res) => {
  try {
    const q = req.query.q;
    const filter = q ? { name: { $regex: q, $options: "i" } } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ---------------- CREATE ---------------- */
router.post(
  "/",
  requireAuth,
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const {
        name,
        price,
        stock = 0,
        category = "",
        image = "",
        description = "",
      } = req.body || {};

      if (!name || price === undefined || price === null) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      const doc = await Product.create({
        name: String(name).trim(),
        price: Number(price),
        stock: Number(stock || 0),
        category: String(category || "").trim(),
        image: String(image || "").trim(),
        description: String(description || "").trim(),
      });

      console.log("✅ Created product:", doc._id, doc.name);
      res.status(201).json(doc);
    } catch (e) {
      console.error("Create product error:", e);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

/* ---------------- READ ONE ---------------- */
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

/* ---------------- UPDATE ---------------- */
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const body = req.body || {};
      if (body.price !== undefined) body.price = Number(body.price);
      if (body.stock !== undefined) body.stock = Number(body.stock);

      const p = await Product.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });
      if (!p) return res.status(404).json({ error: "Not found" });
      console.log("✏️ Updated product:", p._id);
      res.json(p);
    } catch (e) {
      console.error("Update product error:", e);
      res.status(500).json({ error: "Update failed" });
    }
  }
);

/* ---------------- DELETE ---------------- */
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      console.log("🗑️ Deleted product:", req.params.id);
      res.json({ message: "Product deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
