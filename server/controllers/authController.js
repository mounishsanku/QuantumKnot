import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenService.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

    // .toJSON() already removes password as per schema definition
    res.json({ accessToken, rider: rider.toJSON() });
  } catch (err) {
    res.status(500).json({ message: "Internal server error during login" });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

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
    return res.status(403).json({ message: "Authentication failed, invalid refresh token" });
  }
};

export const register = async (req, res) => {
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

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.status(201).json({ accessToken, rider: riderObj });
  } catch (err) {
    console.error("[authController/register] Error:", err.message);
    res.status(500).json({ message: "Internal server error during registration" });
  }
};

export const logout = (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions;
  res.clearCookie("refreshToken", clearOptions);
  res.json({ message: "Successfully logged out" });
};
