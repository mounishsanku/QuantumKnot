import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Rider from "../models/Rider.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenService.js";
import logger from "../logger.js";

const router = express.Router();

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Rider.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // development
      sameSite: "lax",
    });

    res.json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error(`[auth] Login failed: ${err.message}`);
    res.status(500).json({ message: "Login failed" });
  }
});

// 🔹 REFRESH
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Session expired, please login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const rider = await Rider.findById(decoded.id);

    if (!rider) {
      return res.status(403).json({ message: "User account no longer exists" });
    }

    const accessToken = generateAccessToken(rider);
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, upiId, platforms, phone, city, vehicleType, workingHours, dailyEarnings, aadharLast4 } = req.body;

  try {
    const emailNorm = String(email).trim().toLowerCase();
    const exists = await Rider.findOne({ email: emailNorm });

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const rider = await Rider.create({
      name,
      email: emailNorm,
      password: hashed,
      upiId,
      platforms,
      phone,
      city,
      vehicleType,
      workingHours,
      dailyEarnings,
      aadharLast4
    });

    const accessToken = generateAccessToken(rider);
    const refreshToken = generateRefreshToken(rider);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.status(201).json({ 
      token: accessToken,
      accessToken,
      user: riderObj 
    });

  } catch (err) {
    console.error("[register] Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔹 GET ME
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // ✅ SAFETY CHECK (THIS WAS MISSING)
    if (!req.user?.id) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const rider = await Rider.findById(req.user.id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.json({ 
      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        role: rider.role,
        ...riderObj
      } 
    });

  } catch (err) {
    console.error("[getMe] Error:", err.message);
    res.status(500).json({ message: "Internal error" });
  }
});

// 🔹 LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

// ✅ IMPORTANT
export default router;