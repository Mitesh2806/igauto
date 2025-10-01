// src/stores/searchStore.ts

import { create } from 'zustand';
import { useAuthStore } from './authStore';

// We can reuse the same data structure definition from scrapeStore
interface FormattedPost {
  id: string; imageUrl: string; likes: number; comments: number;
  contentType: string; caption: string; postUrl: string; views?: number;
}

interface ScrapedPayload {
  profile: {
    username: string; fullName: string; followers: number; following: number;
    postsCount: number; profilePictureUrl: string;
    recentPosts: FormattedPost[]; recentReels: FormattedPost[];
  };
  analytics: {
    stats: any; growthData: any[]; postPerformance: any[];
  };
}

interface SearchStore {
  searchedData: ScrapedPayload | null;
  isLoading: boolean;
  error: string | null;
  searchProfile: (username: string) => Promise<void>;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchedData: null,
  isLoading: false,
  error: null,

  searchProfile: async (username: string) => {
    set({ isLoading: true, error: null, searchedData: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ isLoading: false, error: "Authentication token not found." });
    }

    try {
      // Note the URL now includes the username parameter
      const response = await fetch(`http://localhost:3000/api/scrape/profile/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch profile data.');
      }

      const data: ScrapedPayload = await response.json();
      set({ searchedData: data, isLoading: false });

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  clearSearch: () => {
    set({ searchedData: null, error: null, isLoading: false });
  },
}));