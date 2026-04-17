import logger from "../logger.js";
import Rider from "../models/Rider.js";

/**
 * Admin Access Control Middleware (Hardened)
 * 
 * Ensures the rider has the 'admin' role by checking the DB directly.
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    const riderId = req.rider?.id || req.user?.id;
    
    if (!riderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const rider = await Rider.findById(riderId);

    if (!rider || rider.role !== "admin") {
      logger.warn(`[auth] Unauthorized admin access attempt by rider: ${riderId}`);
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only"
      });
    }

    next();
  } catch (err) {
    logger.error(`[auth] Admin authorization error: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: "Authorization error"
    });
  }
};
