import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for a single snapshot of post statistics
export interface IAiAnalysis {
  tags: string[];
  vibe: string;
  quality: {
    lighting: string;
  };
}
export interface IPostStats extends Document {
  likeCount: number;
  commentCount: number;
  viewCount?: number;
  scrapedAt: Date;
}

// Interface for the main Post document
export interface IPost extends Document {
  profileId: mongoose.Types.ObjectId;  // Reference to the app user tracking this post
  platform: 'Instagram';
  shortcode: string; // The unique ID from the Instagram URL (e.g., "CtjoC2BNsB2")
  postUrl: string;
  aiAnalysis?: IAiAnalysis; 
  
  // Static data (usually scraped once)
  authorUsername: string;
  authorFullName?: string;
  authorProfilePicture?: string;
  authorIsVerified: boolean;
  caption?: string;
  mediaType: 'Image' | 'Video' | 'Carousel';
  displayUrl: string; // URL for the main image/thumbnail
  videoUrl?: string;
  videoDuration?: number;
  carouselMedia?: {
    type: 'Image' | 'Video';
    url: string;
  }[];
  postedAt: Date; // When the post was originally published on Instagram
  
  // Dynamic data (updated with each scrape)
  statsHistory: IPostStats[];
}

// Schema for the statistics snapshot (to be embedded in the Post schema)
const postStatsSchema = new Schema<IPostStats>({
  likeCount: { type: Number, required: true, default: 0 },
  commentCount: { type: Number, required: true, default: 0 },
  viewCount: { type: Number },
  scrapedAt: { type: Date, default: Date.now },
});

// Main schema for the Post
const postSchema = new Schema<IPost>({
  profileId: {
   type: Schema.Types.ObjectId,
    ref: "ScrapedProfile", // <-- CHANGED ref to ScrapedProfile
    required: true,
  },
  platform: {
    type: String,
    enum: ['Instagram'],
    default: 'Instagram',
  },
  shortcode: {
    type: String,
    required: true,
    unique: true, // Each post should be unique in the database
    index: true,
  },
  postUrl: { type: String, required: true },
  
  // Author and content details
  authorUsername: { type: String, required: true },
  authorFullName: String,
  authorProfilePicture: String,
  authorIsVerified: { type: Boolean, default: false },
  caption: String,
  mediaType: { type: String, enum: ['Image', 'Video', 'Carousel'], required: true },
  displayUrl: { type: String, required: true },
  videoUrl: String,
  videoDuration: Number,
  carouselMedia: [{
    type: { type: String, enum: ['Image', 'Video'] },
    url: String,
  }],
  postedAt: { type: Date, required: true },
  
  // Array of historical stats
  statsHistory: [postStatsSchema],
  aiAnalysis: {
    tags: [String],
    vibe: String,
    quality: {
      lighting: String,
    },
  },
}, { timestamps: true });

const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;