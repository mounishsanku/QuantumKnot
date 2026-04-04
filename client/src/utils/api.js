import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Axios instance with default configurations
export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Variable to track if token is being refreshed to prevent multiple calls
let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queue of failed requests after a successful token refresh.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Attach access token to headers automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Detect 401 errors and handle JWT refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors (No response from server)
    if (!error.response) {
      toast.error("Network error: Please check your internet connection.");
      return Promise.reject(error);
    }

    // Handle 500+ Internal Server Errors (Only show toast, don't redirect yet)
    if (error.response.status >= 500) {
      toast.error(error.response.data?.message || "Internal server error. Our team is has been notified.");
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors specifically for token rotation
    if (error.response.status === 401 && !originalRequest._retry) {
      // If we are already on the login or register page, don't try to refresh
      if (window.location.pathname === "/login" || window.location.pathname === "/register") {
        return Promise.reject(error);
      }

      // If refreshing is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use standard axios for the refresh call to avoid infinite interceptor loops
        const response = await axios.post(
          `${baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem("token", accessToken);

        // Process any requests that failed while the token was refreshing
        processQueue(null, accessToken);

        // Update the header of the original request and retry it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), clear local storage and redirect
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        
        // Force a redirect to login if we are in a session-sensitive area
        if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          toast.error("Session expired — please log in again.");
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Default error handling for 400s (e.g., bad requests, validation errors)
    // We don't toast these globally as specific forms usually handle them
    return Promise.reject(error);
  }
);

/**
 * Helper to generate WebSocket URL based on the API base URL.
 */
export function getSocketUrl() {
  return baseURL.replace(/^http/, "ws");
}
