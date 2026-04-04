import { create } from "zustand";
import { api } from "../utils/api.js";

/**
 * Global Zustand store for rider authentication and state
 */
export const useStore = create((set) => ({
  rider: typeof localStorage !== "undefined" && localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")) 
    : null,
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,

  /**
   * Universal setter for authentication state
   */
  setAuth: (accessToken, rider) => {
    if (accessToken) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(rider));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token: accessToken, rider });
  },

  /**
   * Set global loading state
   */
  setLoading: (val) => set({ loading: val }),

  /**
   * Clear all authentication data and notify backend to clear cookies
   */
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      console.warn("Backend logout failed, clearing local state anyway.");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, rider: null });
    }
  },

  /**
   * Re-sync state from localStorage on app boot
   */
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token) set({ token });
    if (userStr) set({ rider: JSON.parse(userStr) });
  },
}));
