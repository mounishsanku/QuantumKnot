import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

/**
 * Final Unified Authentication Middleware
 * 
 * 1. Checks for Authorization: Bearer <token>
 * 2. Verifies using JWT_ACCESS_SECRET
 * 3. Populates both req.user and req.rider for compatibility
 * 
 * - Returns 401 for ANY token failure (missing, invalid, or expired)
 * - This ensures the frontend interceptor always triggers a consistent redirect.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Missing Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Decode & Verify
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // 3. User Existence
    const rider = await Rider.findById(decoded.id).select("-password");
    if (!rider) {
      return res.status(401).json({ message: "User session not found" });
    }

    // 4. Populate for all routes
    req.user = rider;
    req.rider = rider;
    
    next();
  } catch (err) {
    // Catch-all: Any token error results in 401 to trigger clean frontend logout
    logger.error(`[auth] Verification failed: ${err.message} — Name: ${err.name}`);
    return res.status(401).json({ message: "Session expired or invalid" });
  }
};
