import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import policyRoutes from "./routes/policies.js";
import claimRoutes from "./routes/claims.js";
import adminRoutes from "./routes/admin.js";
import weatherRoutes from "./routes/weatherRoutes.js";

import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import mongoose from "mongoose";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import logger from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ================= ENV LOADING ================= */
const rootEnvPath = path.join(__dirname, "..", ".env");
const serverEnvPath = path.join(__dirname, ".env");

if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
if (fs.existsSync(serverEnvPath)) dotenv.config({ path: serverEnvPath });

/* ================= ENV VALIDATION ================= */
function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    logger.error(`[env] ${name} is missing or empty`);
    process.exit(1);
  }
  return String(v).trim();
}

requireEnv("MONGODB_URI");
requireEnv("JWT_ACCESS_SECRET");
requireEnv("JWT_REFRESH_SECRET");

// Optional (warn only)
if (!process.env.OPENWEATHER_API_KEY) {
  logger.warn("[env] OPENWEATHER_API_KEY missing → weather will fail");
}

/* ================= APP INIT ================= */
const app = express();
const server = http.createServer(app);

/* ================= SECURITY ================= */
const clientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://quantum-knot.vercel.app",
];

app.use(helmet());

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const userId = decoded.id || decoded._id;

    if (!userId) return next(new Error("Invalid token"));

    socket.join(`rider:${userId}`);
    socket.data.riderId = userId;

    next();
  } catch (err) {
    logger.error(`[socket] Auth failed: ${err.message}`);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  logger.info(`Socket connected: rider ${socket.data.riderId}`);
  socket.emit("connected", { ok: true });
});

/* ================= REQUEST LOGGING ================= */
app.use((req, _res, next) => {
  if (req.originalUrl === "/api/health") return next();

  const safeBody =
    req.body && typeof req.body === "object"
      ? {
        ...req.body,
        password: req.body.password ? "[redacted]" : undefined,
      }
      : req.body;

  logger.info(`[http] ${req.method} ${req.originalUrl}`, {
    body: safeBody,
  });

  next();
});

/* ================= HEALTH ================= */
app.get("/api/health", (_req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "ok",
    service: "TriggrPay API",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    database: dbStatus,
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
    },
  });
});

/* ================= DOCS ================= */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ================= CACHE CONTROL ================= */
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  next();
});

/* ================= ROUTES ================= */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

// ✅ WEATHER MUST BE PUBLIC
app.use("/api/weather", weatherRoutes);

/* ================= ERROR HANDLING ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */
const PORT = Number(process.env.PORT) || 5000;

try {
  await connectDB();
  logger.info("MongoDB connected");
} catch (e) {
  logger.error("[startup] MongoDB connection failed:", e?.message || e);
  process.exit(1);
}

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { io };