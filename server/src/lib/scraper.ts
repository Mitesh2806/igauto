// Load environment variables.
// Make sure you have a .env file in your root directory.
// For Node.js v20.6.0+
process.loadEnvFile();

// For older versions, you might need a package like `dotenv`:
// import * as dotenv from 'dotenv';
// dotenv.config();

// --- Type Definitions for Instagram API Response ---

// Describes a single image version candidate
interface ImageCandidate {
  width: number;
  height: number;
  url: string;
}

// Describes a single video version
interface VideoVersion {
  type: number;
  width: number;
  height: number;
  url: string;
  id: string;
}

// Describes the user who made the post
interface InstagramUser {
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
}

// Describes a media item within a carousel
interface CarouselMediaItem {
  image_versions2?: {
    candidates: ImageCandidate[];
  };
  video_versions?: VideoVersion[];
  // Add other properties if needed
}

// Describes the main Instagram post/reel item
interface InstagramPostItem {
  code: string;
  taken_at: number;
  user: InstagramUser;
  is_paid_partnership: boolean;
  product_type: "feed" | "reel" | "carousel_container";
  caption?: {
    text: string;
  };
  like_count: number;
  comment_count: number;
  view_count?: number;
  play_count?: number;
  video_duration?: number;
  location?: object; // Define more specifically if needed
  original_height: number;
  original_width: number;
  image_versions2?: {
    candidates: ImageCandidate[];
  };
  video_versions?: VideoVersion[];
  carousel_media?: CarouselMediaItem[];
}

// --- Type Definition for Our Formatted Data ---

// Describes a formatted carousel item in our final object
interface FormattedCarouselItem {
  image_versions: ImageCandidate[] | undefined;
  video_versions: VideoVersion[] | undefined;
}

// Describes the structure of the final object we want to return
interface FormattedInstagramData {
  code: string;
  created_at: number;
  username: string;
  full_name: string;
  profile_picture: string;
  is_verified: boolean;
  is_paid_partnership: boolean;
  product_type: "feed" | "reel" | "carousel_container";
  caption: string | undefined;
  like_count: number;
  comment_count: number;
  view_count: number | undefined;
  video_duration: number | undefined;
  location: object | undefined;
  height: number;
  width: number;
  image_versions: ImageCandidate[] | undefined;
  video_versions: VideoVersion[] | undefined;
  carousel_media: FormattedCarouselItem[] | undefined;
}


// --- Main Logic ---

const _userAgent: string | undefined = process.env.USER_AGENT;
const _cookie: string | undefined = process.env.COOKIE;
const _xIgAppId: string | undefined = process.env.X_IG_APP_ID;

if (!_userAgent || !_cookie || !_xIgAppId) {
  console.error("Required headers not found in ENV");
  process.exit(1);
}

/**
 * Gets the Instagram post ID from a URL string.
 * @param url The Instagram URL.
 * @returns The post ID string or null if not found.
 */
const getId = (url: string): string | null => {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
  const match = url.match(regex);
  return match && match[2] ? match[2] : null;
};

/**
 * Fetches and formats Instagram data from a URL string.
 * @param url The Instagram URL for a post or reel.
 * @returns A promise that resolves to the formatted data object or "Invalid URL".
 */
const getInstagramData = async (url: string): Promise<FormattedInstagramData | "Invalid URL"> => {
  const igId = getId(url);
  if (!igId) return "Invalid URL";

  const response = await fetch(`https://www.instagram.com/p/${igId}?__a=1&__d=dis`, {
    headers: {
      "Cookie": _cookie,
      "User-Agent": _userAgent,
      "X-IG-App-ID": _xIgAppId,
      "Sec-Fetch-Site": "same-origin"
    }
  });

  const json: { items?: InstagramPostItem[] } = await response.json();
  const item = json?.items?.[0];

  if (!item) {
    // You might want to handle this case more gracefully
    throw new Error("Could not find post data in API response.");
  }
  
  // Check if the post is a carousel
  let carousel_media: FormattedCarouselItem[] | undefined;
  if (item.product_type === "carousel_container" && item.carousel_media) {
    carousel_media = item.carousel_media.map(el => ({
      image_versions: el.image_versions2?.candidates,
      video_versions: el.video_versions
    }));
  }

  // Return a custom, strongly-typed JSON object
  return {
    code: item.code,
    created_at: item.taken_at,
    username: item.user.username,
    full_name: item.user.full_name,
    profile_picture: item.user.profile_pic_url,
    is_verified: item.user.is_verified,
    is_paid_partnership: item.is_paid_partnership,
    product_type: item.product_type,
    caption: item.caption?.text,
    like_count: item.like_count,
    comment_count: item.comment_count,
    view_count: item.view_count ?? item.play_count, // Use nullish coalescing
    video_duration: item.video_duration,
    location: item.location,
    height: item.original_height,
    width: item.original_width,
    image_versions: item.image_versions2?.candidates,
    video_versions: item.video_versions,
    carousel_media
  };
};

// Immediately Invoked Function Expression (IIFE) to run the async code
(async () => {
  // Get data from an Instagram post or reel URL string
  const data = await getInstagramData("https://www.instagram.com/reel/CtjoC2BNsB2");
  console.log(data);
})();