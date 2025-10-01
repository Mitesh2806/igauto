// models/ScrapedProfile.js
import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for a single snapshot of profile statistics
export interface IAudienceDemographics {
  genderSplit: { name: string, value: number }[];
  ageGroups: { name: string, value: number }[];
  topGeographies: { name: string, value: number }[];
}

export interface IProfileStats extends Document {
  followerCount: number;
  followingCount: number;
  postCount: number;
  scrapedAt: Date;
}

// Interface for the main ScrapedProfile document
export interface IScrapedProfile extends Document {
  trackedBy: mongoose.Types.ObjectId; // The app user tracking this profile
  platform: 'Instagram';
  instagramUserId: string; // The unique numerical ID from Instagram
  username: string;
  fullName: string;
  profilePictureUrl: string;
  bio: string;
  isVerified: boolean;
  statsHistory: IProfileStats[]; 
  audienceDemographics?: IAudienceDemographics; // To track follower growth over time
}

const profileStatsSchema = new Schema<IProfileStats>({
  followerCount: { type: Number, required: true },
  followingCount: { type: Number, required: true },
  postCount: { type: Number, required: true },
  scrapedAt: { type: Date, default: Date.now },
});

const scrapedProfileSchema = new Schema<IScrapedProfile>({
  trackedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  platform: {
    type: String,
    enum: ['Instagram'],
    default: 'Instagram',
  },
  instagramUserId: { type: String, required: true },
  username: { type: String, required: true, index: true },
  fullName: String,
  profilePictureUrl: String,
  bio: String,
  isVerified: { type: Boolean, default: false },
  statsHistory: [profileStatsSchema],
   audienceDemographics: {
    genderSplit: [{ name: String, value: Number }],
    ageGroups: [{ name: String, value: Number }],
    topGeographies: [{ name: String, value: Number }],
  },
}, { timestamps: true });


// Create a compound index to ensure a user tracks a username only once
scrapedProfileSchema.index({ trackedBy: 1, username: 1 }, { unique: true });

const ScrapedProfile: Model<IScrapedProfile> = mongoose.model<IScrapedProfile>("ScrapedProfile", scrapedProfileSchema);

export default ScrapedProfile;