import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import claimsRoutes from "./routes/claims.js";
import policiesRoutes from "./routes/policies.js";
import weatherRoutes from "./routes/weatherRoutes.js";

dotenv.config();

const app = express();

// ✅ CONNECT DB
connectDB();

// ✅ MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

// 🔥 FIXED CORS (CRITICAL)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quantum-knot.vercel.app",
      "https://quantum-knot-fsyedypzx-shankarbannu143-1339s-projects.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/weather", weatherRoutes);

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.rider = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  if (socket.rider) {
    socket.join(`rider:${socket.rider.id}`);
  }
  socket.on("disconnect", () => {});
});

app.set("io", io);