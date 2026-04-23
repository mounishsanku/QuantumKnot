import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Prevent multiple redirects
let isRedirecting = false;

// =========================
// REQUEST INTERCEPTOR
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error: Server unreachable");
      return Promise.reject(error);
    }

    const { status, data, config } = error.response;
    const url = config.url?.toLowerCase() || "";

    // Ignore public APIs
    if (url.includes("/weather") || url.includes("/health")) {
      return Promise.reject(error);
    }

    // 401 HANDLING
    if (status === 401) {
      console.warn("[API] 401 received from:", url);

      // ❗ ONLY logout if it's auth-related
      if (url.includes("/auth")) {
        if (!isRedirecting && window.location.pathname !== "/login") {
          isRedirecting = true;

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          toast.error("Session expired. Please log in again.");

          setTimeout(() => {
            window.location.replace("/login");
          }, 800);
        }
      } else {
        // ✅ DO NOT logout for normal API failures
        console.warn("[API] Ignoring 401 for non-auth route:", url);
      }
    }

    // 403 HANDLING
    if (status === 403) {
      console.warn("[API] Forbidden:", data?.message || "Admin access required");
      toast.error(data?.message || "Access denied");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // SERVER ERRORS
    if (status >= 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);