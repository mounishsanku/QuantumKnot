import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

/**
 * Unified Authentication Middleware
 * 
 * 1. Checks for Authorization: Bearer <token>
 * 2. Verifies using JWT_ACCESS_SECRET
 * 3. populates both req.user and req.rider for compatibility
 * 
 * Errors:
 * - 401: Token missing or malformed
 * - 403: Token invalid or expired
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Fetch rider data to populate req objects
    const rider = await Rider.findById(decoded.id).select("-password");
    if (!rider) {
      return res.status(403).json({ message: "User no longer exists" });
    }

    // Attach to both properties as requested
    req.user = rider;
    req.rider = rider;
    
    next();
  } catch (err) {
    // If token is invalid or expired, return 403 Forbidden as per request
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};
