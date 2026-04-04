import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";
import { authMiddleware } from "../middleware/auth.js";
import logger from "../logger.js";

const router = Router();

function signToken(riderId) {
  return jwt.sign({ id: riderId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    logger.info("[auth/register] incoming body (password redacted)", {
      ...body,
      password: body.password ? "[redacted]" : undefined,
    });

    const {
      name,
      email,
      password,
      upiId,
      platforms,
      phone,
      city,
      vehicleType,
      workingHours,
      dailyEarnings,
      aadharLast4,
    } = body;

    const missing = [];
    if (!name || !String(name).trim()) missing.push("name");
    if (!email || !String(email).trim()) missing.push("email");
    if (!password) missing.push("password");
    if (!upiId || !String(upiId).trim()) missing.push("upiId");
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      missing.push("platforms");
    }

    if (missing.length) {
      const msg = `Missing required field(s): ${missing.join(", ")}`;
      logger.warn(`[auth/register] ${msg}`);
      return res.status(400).json({ message: msg });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const exists = await Rider.findOne({ email: emailNorm });
    if (exists) {
      logger.warn(`[auth/register] email already registered: ${emailNorm}`);
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const rider = await Rider.create({
      name: String(name).trim(),
      email: emailNorm,
      phone: phone ? String(phone).trim() : "",
      password: hashed,
      city: city || "Hyderabad",
      vehicleType: vehicleType || "petrol",
      workingHours: workingHours || "flexible",
      dailyEarnings: dailyEarnings != null ? Number(dailyEarnings) : 700,
      aadharLast4: aadharLast4 ? String(aadharLast4).slice(-4) : "",
      upiId: String(upiId).trim(),
      platforms,
    });

    const token = signToken(rider._id);
    const out = rider.toJSON();
    logger.info(`[auth/register] success riderId=${rider._id}`);

    // ── Simulate Aadhaar KYC verification (async, non-blocking) ──
    setTimeout(async () => {
      try {
        rider.kycStatus = "verified";
        await rider.save();
        logger.info(`[kyc] Aadhaar KYC verified for rider ${rider._id}`);
      } catch (kycErr) {
        logger.warn(`[kyc] KYC verification failed for rider ${rider._id}: ${kycErr.message}`);
      }
    }, 1500);

    res.status(201).json({ token, rider: out });
  } catch (err) {
    logger.error("[auth/register] error:", err.message, err.stack);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const rider = await Rider.findOne({ email: emailNorm });
    if (!rider) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, rider.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(rider._id);
    const out = rider.toJSON();
    res.json({ token, rider: out });
  } catch (err) {
    logger.error("[auth/login] error:", err.message, err.stack);
    res.status(500).json({ message: err.message || "Login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ rider: req.rider });
});

export default router;
