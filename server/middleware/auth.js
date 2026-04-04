import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rider = await Rider.findById(decoded.id).select("-password");
    if (!rider) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.rider = rider;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
