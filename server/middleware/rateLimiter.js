import rateLimit from "express-rate-limit";

/**
 * Global rate limiter: 100 requests per 15 minutes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Auth rate limiter: 5 requests per 1 minute
 * Specifically for login, register, and refresh endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    message: "Too many authentication attempts, please try again after a minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
