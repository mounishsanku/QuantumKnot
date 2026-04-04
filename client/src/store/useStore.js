import { create } from "zustand";

export const useStore = create((set) => ({
  rider: null,
  token: typeof localStorage !== "undefined" ? localStorage.getItem("token") : null,
  setAuth: (token, rider) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token, rider });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, rider: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    set({ token });
  },
}));
