import { create } from "zustand";
import { api } from "../utils/api.js";

/**
 * SAFE JSON PARSE
 */
const safeParse = (value) => {
  try {
    return value && value !== "undefined" ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const useStore = create((set) => ({
  // ✅ FIXED SAFE INIT
  rider: typeof localStorage !== "undefined"
    ? safeParse(localStorage.getItem("user"))
    : null,

  token: typeof localStorage !== "undefined"
    ? localStorage.getItem("token")
    : null,

  loading: false,

  /**
   * SET AUTH
   */
  setAuth: (token, rider) => {
    if (token) {
      localStorage.setItem("token", token); 
      localStorage.setItem("user", JSON.stringify(rider));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    set({ token, rider });
  },

  /**
   * LOADING
   */
  setLoading: (val) => set({ loading: val }),

  /**
   * LOGOUT
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
   * HYDRATE
   */
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token) set({ token });
    if (userStr) set({ rider: safeParse(userStr) });
  },
}));