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
// ❌ REMOVED Redis-related imports
// import { startTriggerMonitor } from "./jobs/triggerMonitor.js";
// import { startTriggerWorker } from "./jobs/triggerWorker.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import mongoose from "mongoose";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import logger from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.join(__dirname, "..", ".env");
const serverEnvPath = path.join(__dirname, ".env");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    logger.error(
      `[env] ${name} is missing or empty. Create ${rootEnvPath} with ${name}=...`
    );
    process.exit(1);
  }
  return String(v).trim();
}

requireEnv("MONGODB_URI");
requireEnv("JWT_ACCESS_SECRET");
requireEnv("JWT_REFRESH_SECRET");

const app = express();
const server = http.createServer(app);

const clientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://quantum-knot.vercel.app"
];

// Security setup
app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);

app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

// Socket setup
const io = new Server(server, {
  cors: { origin: clientOrigins, methods: ["GET", "POST"], credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(String(token), process.env.JWT_ACCESS_SECRET);
    socket.join(`rider:${decoded.id}`);
    socket.data.riderId = decoded.id;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  logger.info(`Socket connected: rider ${socket.data.riderId}`);
  socket.emit("connected", { ok: true });
});

// Logging
app.use((req, _res, next) => {
  if (req.originalUrl === "/api/health") return next();

  const safeBody =
    req.body && typeof req.body === "object"
      ? { ...req.body, password: req.body.password ? "[redacted]" : undefined }
      : req.body;

  logger.info(`[http] ${req.method} ${req.originalUrl}`, { body: safeBody });
  next();
});

// Routes
app.get("/api/health", (_req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "ok",
    service: "TriggrPay API",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    database: dbStatus,
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    },
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/weather", weatherRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

// DB connect
try {
  await connectDB();
  logger.info("MongoDB connected");
} catch (e) {
  logger.error("[startup] MongoDB connection failed:", e?.message || e);
  process.exit(1);
}

// ❌ REMOVED Redis jobs completely
// startTriggerMonitor(io);
// startTriggerWorker(io);

// Start server
server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

export { io };