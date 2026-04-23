import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null;

/**
 * Create a Socket.IO connection with reconnect limits.
 * Returns null if no token is available.
 * Reuses existing connection if already connected.
 */
export function createSocket(token) {
  if (!token) {
    console.log("[SOCKET] Skipping connection (no token)");
    return null;
  }

  // Prevent multiple connections — reuse existing
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Disconnect stale instance before creating new one
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  const socket = io(API_BASE, {
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("token"),
    },
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    timeout: 5000,
  });

  socket.on("connect", () => {
    console.log("[SOCKET] Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("[SOCKET] Connection failed:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[SOCKET] Disconnected:", reason);
  });

  socketInstance = socket;
  return socket;
}

/**
 * Disconnect and destroy the current socket instance.
 */
export function destroySocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * Get the current socket instance (may be null).
 */
export function getSocket() {
  return socketInstance;
}
