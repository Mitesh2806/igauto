// src/stores/scrapeStore.ts

import { create } from 'zustand';
import { useAuthStore } from './authStore';

// Type definitions that match the backend response
interface IAiAnalysis {
  tags: string[];
  vibe: string;
  quality: { lighting: string; };
}
interface IAudienceDemographics {
  genderSplit: { name: string, value: number }[];
  ageGroups: { name: string, value: number }[];
  topGeographies: { name: string, value: number }[];
}
interface FormattedPost {
  id: string; imageUrl: string; likes: number; comments: number;
  contentType: string; caption: string; postUrl: string; views?: number;
}

interface ScrapedPayload {
  profile: {
    username: string; fullName: string; followers: number; following: number;
    postsCount: number; profilePictureUrl: string;
    recentPosts: FormattedPost[]; recentReels: FormattedPost[];
    audienceDemographics?: IAudienceDemographics; 
  };
  analytics: {
    stats: any; growthData: any[]; postPerformance: any[];
  };
  aiAnalysis?: IAiAnalysis;
}

interface ScrapeStore {
  scrapedData: ScrapedPayload | null;
  isLoading: boolean;
  error: string | null;
  fetchProfileData: () => Promise<void>;
  clearScrapedData: () => void;
}

export const useScrapeStore = create<ScrapeStore>((set) => ({
  scrapedData: null,
  isLoading: false,
  error: null,

  fetchProfileData: async () => {
    set({ isLoading: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ isLoading: false, error: "Authentication token not found." });
    }

    try {
      const response = await fetch("http://https://igauto.onrender.com/api/scrape/profile", {
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
      set({ scrapedData: data, isLoading: false });

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  clearScrapedData: () => {
    set({ scrapedData: null, error: null, isLoading: false });
  },
}));