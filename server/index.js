import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import policyRoutes from "./routes/policies.js";
import claimRoutes from "./routes/claims.js";
import adminRoutes from "./routes/admin.js";
// ❌ REMOVED Redis-related imports
// import { startTriggerMonitor } from "./jobs/triggerMonitor.js";
// import { startTriggerWorker } from "./jobs/triggerWorker.js";
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
requireEnv("JWT_SECRET");

const app = express();
const server = http.createServer(app);

const clientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://quantum-knot.vercel.app"
];

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Socket setup
const io = new Server(server, {
  cors: { origin: clientOrigins, methods: ["GET", "POST"], credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(String(token), process.env.JWT_SECRET);
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
  res.json({ ok: true, service: "TriggrPay API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  logger.error("[express]", err.stack || err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

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