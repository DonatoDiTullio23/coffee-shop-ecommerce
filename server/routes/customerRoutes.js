// server/routes/customerRoutes.js
import express from "express";
let Order = null;
try {
  Order = (await import("../models/Order.js")).default;
} catch (e) {
}

const router = express.Router();

console.log("✅ customerRoutes loaded");

router.get("/ping", (_req, res) => res.json({ pong: true }));

router.get("/", async (req, res) => {
  try {
    const { q = "", sort = "orders", dir = "desc", page = "1", limit = "12" } = req.query;

    if (!Order) return res.json({ items: [], page: 1, limit: 12, _stub: true });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, parseInt(limit, 10) || 12);
    const direction = String(dir).toLowerCase() === "asc" ? 1 : -1;
    const match = q
      ? { $or: [{ "customer.name": new RegExp(q, "i") }, { "customer.email": new RegExp(q, "i") }] }
      : {};
    const sortKeyMap = { orders: "orders", total: "totalSpent", last: "lastOrderAt", name: "name", email: "email" };

    const items = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$customer.email",
          email: { $first: "$customer.email" },
          name: { $last: "$customer.name" },
          orders: { $sum: 1 },
          totalSpent: { $sum: { $ifNull: ["$total", 0] } },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
      { $match: { email: { $ne: null } } },
      { $sort: { [sortKeyMap[sort] || "orders"]: direction } },
      { $skip: (pageNum - 1) * perPage },
      { $limit: perPage },
    ]);

    res.json({ items, page: pageNum, limit: perPage });
  } catch (err) {
    console.error("GET /api/customers failed:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

export default router;
