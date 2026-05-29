// server/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import bus from "../events.js"; 
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const created = await Order.create({
      customer: body.customer || {},
      items: (body.items || []).map((i) => ({
        productId: i.productId || i._id || i.id || undefined,
        name: i.name,
        price: Number(i.price || 0),
        quantity: Number(i.quantity || i.qty || 1),
        image: i.image || "",
      })),
      subtotal: Number(body.subtotal || 0),
      shipping: Number(body.shipping || 0),
      tax: Number(body.tax || 0),
      total: Number(body.total || 0),
      paymentStatus: body.paymentStatus || "paid",
      status: body.status || "new",
    });

    try {
      bus.emit("order:new", {
        id: created._id,
        number: created.number,
        total: created.total,
        createdAt: created.createdAt,
        customer: {
          email: created.customer?.email || "",
          name: created.customer?.name || "",
        },
      });
    } catch (emitErr) {
      console.warn("SSE emit failed (order:new):", emitErr);
    }

    res.status(201).json(created);
  } catch (e) {
    console.error("Create order error:", e);
    res.status(400).json({ error: "Could not create order" });
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      q = "",
      status = "all",
      sort = "created",
      dir = "desc",
      page = "1",
      limit = "12",
    } = req.query;

    const find = {};
    if (status !== "all") find.status = status;

    if (q) {
      const rx = new RegExp(q, "i");
      find.$or = [{ number: rx }, { "customer.name": rx }, { "customer.email": rx }];
    }

    const sortMap = { created: "createdAt", total: "total", status: "status" };
    const sortBy = sortMap[sort] || "createdAt";
    const direction = String(dir).toLowerCase() === "asc" ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, parseInt(limit, 10) || 12);

    const [items, total] = await Promise.all([
      Order.find(find)
        .sort({ [sortBy]: direction })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Order.countDocuments(find),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    });
  } catch (e) {
    console.error("List orders error:", e);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/** GET /api/orders/:id */
router.get("/:id", async (req, res) => {
  const ord = await Order.findById(req.params.id).lean();
  if (!ord) return res.status(404).json({ error: "Not found" });
  res.json(ord);
});

export default router;
