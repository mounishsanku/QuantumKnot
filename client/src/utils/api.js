import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Unified API Instance: Final Hardened Version
 * 
 * - Unifies redirect logic for all auth failures
 * - Deduplicates "Session expired" toasts during cascading failures
 */
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple redirects during concurrent 401s
let isRedirecting = false;

// Request Interceptor: Attach token
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

// Response Interceptor: Unified failure handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Network Errors
    if (!error.response) {
      toast.error("Network error: Server unreachable");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 2. Unify 401/403 as "Session Expired"
    if (status === 401 || status === 403) {
      console.warn(`[api] Authentication failure (${status}).`);

      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.clear();
        
        // Only redirect if not already on the login page
        if (window.location.pathname !== "/login") {
          toast.error("Session expired. Please log in again.", { id: "auth-expired" });
          
          // Delay redirect slightly to allow toast to be seen
          setTimeout(() => {
            window.location.replace("/login");
          }, 800);
        } else {
          isRedirecting = false;
        }
      }
    }

    // 3. Handle 500+ Errors
    if (status >= 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export function getSocketUrl() {
  return baseURL.replace(/^http/, "ws");
}
