import jwt from "jsonwebtoken";

export const generateAccessToken = (rider) => {
  return jwt.sign(
    { id: rider._id, role: rider.role || "rider" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

export const generateRefreshToken = (rider) => {
  return jwt.sign(
    { id: rider._id, role: rider.role || "rider" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};
