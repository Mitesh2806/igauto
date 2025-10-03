
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

// --- Existing Type Definitions ---

export interface ScrapedProfileData {
  username: string;
  fullName: string;
  followers: number;
  following: number;
  postsCount: number;
  profilePictureUrl: string;
  recentPosts: FormattedPost[];
  recentReels: FormattedPost[];
}

interface FormattedPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  contentType: string;
  caption: string;
  postUrl: string;
  views?: number;
}

interface Cookie {
  name: string;
  value: string;
}

// --- Environment Variables ---
const _userAgent: string | undefined = process.env.USER_AGENT;
const _xIgAppId: string | undefined = process.env.X_IG_APP_ID;

if (!_userAgent || !_xIgAppId) {
  console.error("Required headers for scraper not found in ENV");
  throw new Error("Server is missing required scraper environment variables.");
}

export const scrapeInstagramProfile = async (
  username: string
): Promise<ScrapedProfileData | null> => {
  console.log(`[API Scraper]: Starting scrape for profile: ${username}`);
  try {
    // --- 1. Authentication & Header Setup ---
    console.log('[API Scraper]: Loading session cookies for authentication...');
    const cookiesPath = path.join(process.cwd(), 'cookies.json');
    const cookiesString = fs.readFileSync(cookiesPath, 'utf-8');
    const cookies: Cookie[] = JSON.parse(cookiesString);

    const csrftoken = cookies.find(c => c.name === 'csrftoken')?.value;
    const sessionid = cookies.find(c => c.name === 'sessionid')?.value;
    const ds_user_id = cookies.find(c => c.name === 'ds_user_id')?.value;

    if (!sessionid || !csrftoken || !ds_user_id) {
      throw new Error('Essential cookies (sessionid, csrftoken, ds_user_id) not found in cookies.json.');
    }

    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const headers = {
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cookie": cookieString,
      "Referer": `https://www.instagram.com/${username}/`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": _userAgent,
      "X-ASBD-ID": "129477",
      "X-CSRFToken": csrftoken,
      "X-IG-App-ID": _xIgAppId,
      "X-IG-WWW-Claim": "0",
      "X-Requested-With": "XMLHttpRequest"
    };

    // --- 2. Fetch Basic Profile Info ---
    console.log(`[API Scraper]: Fetching profile info for ${username}...`);
    const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const profileResponse = await fetch(profileUrl, { headers });

    if (!profileResponse.ok) {
      const errorBody = await profileResponse.text();
      throw new Error(`Failed to fetch profile. Status: ${profileResponse.status}. Body: ${errorBody}`);
    }

    const profileJson = await profileResponse.json();
    const userData = profileJson.data.user;

    if (!userData) {
      throw new Error(`User not found or profile is private: ${username}`);
    }
    const userId = userData.id;
    const basicInfo = {
      username: userData.username,
      fullName: userData.full_name,
      followers: userData.edge_followed_by.count,
      following: userData.edge_follow.count,
      postsCount: userData.edge_owner_to_timeline_media.count,
      profilePictureUrl: userData.profile_pic_url_hd,
    };

    // --- 3. Fetch User Feed ---
    console.log(`[API Scraper]: Fetching posts for user ID ${userId}...`);
    const feedUrl = `https://www.instagram.com/api/v1/feed/user/${userId}/`;
    const feedResponse = await fetch(feedUrl, { headers });

    if (!feedResponse.ok) {
      const errorBody = await feedResponse.text();
      throw new Error(`Failed to fetch user feed. Status: ${feedResponse.status}. Body: ${errorBody}`);
    }
    const feedJson = await feedResponse.json();

    // --- 4. Process Feed Items ---
    const allPosts: FormattedPost[] = [];

    feedJson.items.forEach((item: any) => {
      // Stop if we already have 10 posts
      if (allPosts.length >= 5) {
        return;
      }
      
      const imageUrl = item.image_versions2?.candidates[0]?.url || 
                       item.carousel_media?.[0]?.image_versions2?.candidates[0]?.url;

      // Determine the content type
      let contentType: string;
      if (item.product_type === 'clips') {
        contentType = 'Reel';
      } else if (item.media_type === 1) {
        contentType = 'Image';
      } else if (item.media_type === 8) {
        contentType = 'Carousel';
      } else if (item.media_type === 2) {
        contentType = 'Video';
      } else {
        contentType = 'Unknown';
      }

      const postData: FormattedPost = {
        id: item.id,
        imageUrl: imageUrl,
        contentType: contentType,
        likes: item.like_count || 0,
        comments: item.comment_count || 0,
        caption: item.caption?.text || "",
        postUrl: `https://www.instagram.com/p/${item.code}/`
      };

      // Add views for reels and videos
      if (contentType === 'Reel' || contentType === 'Video') {
        postData.views = item.play_count || 0;
      }

      allPosts.push(postData);
    });

    // Separate into recentPosts and recentReels
    const recentPosts = allPosts;
    const recentReels = allPosts.filter(post => post.contentType === 'Reel');

    const finalData: ScrapedProfileData = { 
      ...basicInfo, 
      recentPosts,
      recentReels
    };

    return finalData;

  } catch (error) {
    console.error('[API Scraper]: An error occurred:', error);
    if (error instanceof SyntaxError) {
        console.error("Received HTML instead of JSON. Your cookies might be invalid or expired.");
    }
    return null;
  }
};