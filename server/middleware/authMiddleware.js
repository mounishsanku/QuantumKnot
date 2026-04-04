import jwt from "jsonwebtoken";
import logger from "../logger.js";

/**
 * Final Hardened Authentication Middleware
 * 
 * 1. Extract token from Authorization: Bearer <token>
 * 2. Verify using JWT_ACCESS_SECRET
 * 3. Attach decoded payload to req.user and req.rider
 * 
 * Status Codes:
 * - 401: Token missing
 * - 403: Token invalid or expired
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Missing Token -> 401
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // 3. Attach decoded payload as requested
    req.user = decoded;
    req.rider = decoded;
    
    next();
  } catch (err) {
    // 4. Invalid or Expired -> 403
    logger.error(`[auth] Verification failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
