import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Centralized API instance for TriggrPay
 * 
 * - Automatically attaches JWT Bearer token
 * - Handles 401 Unauthorized globally by clearing session and redirecting
 * - Supports withCredentials for cookie-based refresh (if needed later)
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach token from localStorage
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

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Network Errors
    if (!error.response) {
      toast.error("Network error: Server unreachable");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 2. Handle 401 Unauthorized (Force Logout)
    if (status === 401) {
      console.warn("[api] 401 Unauthorized detected. Clearing session.");
      localStorage.clear();
      
      // Prevent redirect loop if already on login page
      if (window.location.pathname !== "/login") {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }

    // 3. Handle 403 Forbidden (Invalid token/Expired - also clear session for safety)
    if (status === 403) {
      console.warn("[api] 403 Forbidden detected. Clearing session.");
      localStorage.clear();
      if (window.location.pathname !== "/login") {
        toast.error("Access denied or session expired.");
        window.location.href = "/login";
      }
    }

    // 4. Handle 500+ Errors
    if (status >= 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export function getSocketUrl() {
  return baseURL.replace(/^http/, "ws");
}
