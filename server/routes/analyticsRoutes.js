// server/routes/analyticsRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();
console.log("✅ analyticsRoutes loaded");

router.get("/ping", (_req, res) => res.json({ pong: true }));

// GET /api/analytics?days=30
router.get("/", async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days || "30", 10)));
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    const low = Math.max(0, parseInt(req.query.low || "5", 10)); // <= threshold
    const lowLimit = Math.max(1, Math.min(100, parseInt(req.query.lowLimit || "10", 10)));

    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$total", 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueTotal = salesByDay.reduce((a, d) => a + (d.revenue || 0), 0);
    const ordersTotal  = salesByDay.reduce((a, d) => a + (d.orders  || 0), 0);

    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          name: { $first: "$items.name" },
          qty: { $sum: { $ifNull: ["$items.quantity", 0] } },
          revenue: {
            $sum: {
              $multiply: [{ $ifNull: ["$items.price", 0] }, { $ifNull: ["$items.quantity", 0] }],
            },
          },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]);
 
    const lowInventory = await Product.aggregate([
      {
        $addFields: {
          _stock: {
            $ifNull: [
              "$stock",
              { $ifNull: ["$quantity", "$inventory"] }
            ]
          }
        }
      },
      { $match: { _stock: { $lte: low } } },
      { $project: { name: 1, category: 1, price: 1, stock: "$_stock" } },
      { $sort: { stock: 1, name: 1 } },
      { $limit: lowLimit }
    ]);
    res.json({
      kpis: {
        revenueTotal,
        ordersTotal,
        avgOrderValue: revenueTotal / Math.max(1, ordersTotal),
      },
      salesByDay,
      topProducts,
      lowInventory,
      range: { days, low, lowLimit },
    });
  } catch (e) {
    console.error("GET /api/analytics failed:", e);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

export default router;
