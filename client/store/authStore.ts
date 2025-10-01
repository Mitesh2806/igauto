import { create } from 'zustand';
import { useScrapeStore } from './scrapeStore'; // 1. Import the scrape store

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  instaHandle: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  register: (instaHandle: string, email: string, password: string) => Promise<{ success: boolean; error?: string; }>;
  login: (instaHandle: string, password: string) => Promise<{ success: boolean; error?: string; }>;
  logout: () => void;
  checkAuth: () => void;
}

// --- STORE IMPLEMENTATION ---
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (instaHandle, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instaHandle, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (instaHandle, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instaHandle, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials.");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      set({ user: data.user, token: data.token, isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    // Clear auth state from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Clear auth state in Zustand
    set({ user: null, token: null });

    // 2. Clear the scraped data state as well
    useScrapeStore.getState().clearScrapedData();
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;

    if (token && user) {
      set({ token, user });
    }
  },
}));