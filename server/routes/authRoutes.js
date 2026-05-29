// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.get("/ping", (_req, res) => res.json({ pong: true }));

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ Missing JWT_SECRET env var");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1d" });
    return res.json({
      token,
      user: { email: user.email, role: user.role, name: user.name || "" },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ Missing JWT_SECRET env var");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return res.json({ user: { id: decoded.id, role: decoded.role } });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
