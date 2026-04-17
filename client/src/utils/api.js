import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Global API Instance: Final Hardened Version
 * 
 * - Unifies redirect logic based on CRITICAL requirements
 * - ONLY log out on 401 (Missing Token)
 * - DO NOT log out on 403 (Invalid/Expired)
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple redirects during concurrent 401s
let isRedirecting = false;

// Request Interceptor: Attach token + Debug Log
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // CRITICAL: Skip Auth for public requests
    if (config.isPublic || config.url.includes("/weather")) {
      console.log("TOKEN: SKIPPING (Public Request)");
      return config;
    }

    // CRITICAL: Debug log requested by user
    console.log("TOKEN:", token);

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Strict Logout Logic
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error: Server unreachable");
      return Promise.reject(error);
    }

    const { status, data, config } = error.response;
    const url = config.url?.toLowerCase() || "";

    /**
     * CRITICAL: Robust route-based skip for public APIs
     * We don't want to show "Session expired" for public routes like weather
     */
    if (url.includes("/weather") || url.includes("/health")) {
      console.log(`[api] Ignoring ${status} for public route: ${url}`);
      return Promise.reject(error);
    }

    /**
     * CRITICAL: Strict Logout Filter
     * - Status 401: Clear and redirect to login
     * - Status 403: Do NOT Logout (per instruction)
     */
    if (status === 401) {
      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;
        // ONLY clear if we are not already trying to log in
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error("Session expired. Please log in again.");

        setTimeout(() => {
          window.location.replace("/login");
        }, 800);
      }
    }

    // Inform user of error without logging out for 403 or 500
    if (status === 403) {
      // Prevent toast spam for admin-only endpoints
      console.warn("Admin access required:", data?.message || "Forbidden");
    } else if (status >= 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export function getSocketUrl() {
  return baseURL.replace(/^http/, "ws");
}
