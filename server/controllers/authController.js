import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";
import logger from "../logger.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * 🔥 TOKEN HELPERS (FIXED)
 */
const generateAccessToken = (rider) => {
  return jwt.sign(
    {
      id: rider._id.toString(),
      role: rider.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (rider) => {
  return jwt.sign(
    {
      id: rider._id.toString(),
      role: rider.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const rider = await Rider.findOne({ email });

    if (!rider) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, rider.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(rider);
    const refreshToken = generateRefreshToken(rider);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.json({
      success: true,
      token: accessToken,
      rider: {
        id: rider._id,
        email: rider.email,
        role: rider.role
      }
    });
  } catch (err) {
    logger.error(`[auth] Login error: ${err.message}`);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

/**
 * REFRESH TOKEN
 */
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Session expired, please login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // ✅ VALIDATE decoded.id
    if (!decoded.id) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    const rider = await Rider.findById(decoded.id);

    if (!rider) {
      return res.status(403).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(rider);

    res.json({ accessToken });
  } catch (err) {
    logger.error(`[auth] Refresh failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

/**
 * REGISTER
 */
export const register = async (req, res) => {
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
  } = req.body;

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
      aadharLast4,
    });

    const accessToken = generateAccessToken(rider);
    const refreshToken = generateRefreshToken(rider);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.status(201).json({
      accessToken,
      rider: riderObj,
    });
  } catch (err) {
    logger.error(`[auth] Register error: ${err.message}`);
    res.status(500).json({ message: "Internal server error during registration" });
  }
};

/**
 * GET CURRENT USER
 */
export const getMe = async (req, res) => {
  try {
    // ✅ VALIDATION
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rider = await Rider.findById(req.user.id);

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.json({ 
      id: rider._id,
      email: rider.email,
      role: rider.role
    });
  } catch (err) {
    logger.error(`[auth] getMe error: ${err.message}`);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/**
 * LOGOUT
 */
export const logout = (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions;
  res.clearCookie("refreshToken", clearOptions);
  res.json({ message: "Logged out successfully" });
};