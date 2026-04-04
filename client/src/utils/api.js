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
    
    // CRITICAL: Debug log requested by user
    console.log("TOKEN:", token);

    if (token) {
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

    const { status, data } = error.response;

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
      toast.error(data?.message || "Invalid or expired session access.");
    } else if (status >= 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export function getSocketUrl() {
  return baseURL.replace(/^http/, "ws");
}
