import jwt from "jsonwebtoken";
import logger from "../logger.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Missing Token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log("DECODED TOKEN:", decoded);

    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    logger.error(`[auth] Verification failed: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};