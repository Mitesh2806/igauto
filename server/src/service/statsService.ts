// src/services/statsService.ts
import ScrapedProfile from '../models/ScrappedProfile.js';
import Post from '../models/Post.js';
import mongoose from 'mongoose';

export interface ProfileStats {
  averageLikes: number;
  averageComments: number;
  averageViews: number;
  engagementRate: number;
  totalPosts: number;
  bestPerformingPost: {
    shortcode: string;
    likes: number;
    comments: number;
    url: string;
  } | null;
}

export interface GrowthData {
  date: string;
  followers: number;
  following: number;
  posts: number;
}

export interface PostPerformance {
  date: string;
  likes: number;
  comments: number;
  views: number;
  postUrl: string;
}

/**
 * Calculate average statistics for a profile based on recent posts
 */
export const calculateProfileStats = async (
  username: string,
  trackedByUserId: mongoose.Types.ObjectId
): Promise<ProfileStats | null> => {
  try {
    const profile = await ScrapedProfile.findOne({ 
      username, 
      trackedBy: trackedByUserId 
    });

    if (!profile) return null;

    const posts = await Post.find({ profileId: profile._id });

    if (posts.length === 0) {
      return {
        averageLikes: 0,
        averageComments: 0,
        averageViews: 0,
        engagementRate: 0,
        totalPosts: 0,
        bestPerformingPost: null,
      };
    }

    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let bestPost = posts[0];
    let bestEngagement = 0;

    posts.forEach(post => {
      const latestStats = post.statsHistory[post.statsHistory.length - 1];
      if (latestStats) {
        totalLikes += latestStats.likeCount;
        totalComments += latestStats.commentCount;
        totalViews += latestStats.viewCount || 0;

        const engagement = latestStats.likeCount + latestStats.commentCount;
        if (engagement > bestEngagement) {
          bestEngagement = engagement;
          bestPost = post;
        }
      }
    });

    const averageLikes = totalLikes / posts.length;
    const averageComments = totalComments / posts.length;
    const averageViews = totalViews / posts.length;

    // Engagement rate = (likes + comments) / followers * 100
    const latestProfileStats = profile.statsHistory[profile.statsHistory.length - 1];
    const followers = latestProfileStats?.followerCount || 1;
    const engagementRate = ((totalLikes + totalComments) / posts.length / followers) * 100;
//@ts-ignore
    const bestPostStats = bestPost.statsHistory[bestPost.statsHistory.length - 1];

    return {
      averageLikes: Math.round(averageLikes),
      averageComments: Math.round(averageComments),
      averageViews: Math.round(averageViews),
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      totalPosts: posts.length,
     
      bestPerformingPost: {
         //@ts-ignore
        shortcode: bestPost.shortcode,
         //@ts-ignore
        likes: bestPostStats.likeCount,
         //@ts-ignore
        comments: bestPostStats.commentCount,
         //@ts-ignore
        url: bestPost.postUrl,
      },
    };
  } catch (error) {
    console.error('Error calculating profile stats:', error);
    return null;
  }
};

/**
 * Get growth data over time for a profile
 */
export const getGrowthData = async (
  username: string,
  trackedByUserId: mongoose.Types.ObjectId
): Promise<GrowthData[]> => {
  try {
    const profile = await ScrapedProfile.findOne({ 
      username, 
      trackedBy: trackedByUserId 
    });

    if (!profile || !profile.statsHistory) return [];
 //@ts-ignore
    return profile.statsHistory.map(stat => ({
      date: stat.scrapedAt.toISOString().split('T')[0],
      followers: stat.followerCount,
      following: stat.followingCount,
      posts: stat.postCount,
    }));
  } catch (error) {
    console.error('Error getting growth data:', error);
    return [];
  }
};

/**
 * Get post performance over time
 */
export const getPostPerformance = async (
  username: string,
  trackedByUserId: mongoose.Types.ObjectId
): Promise<PostPerformance[]> => {
  try {
    const profile = await ScrapedProfile.findOne({ 
      username, 
      trackedBy: trackedByUserId 
    });

    if (!profile) return [];

    const posts = await Post.find({ profileId: profile._id }).sort({ createdAt: -1 }).limit(10);
 //@ts-ignore
    return posts.map(post => {
      const latestStats = post.statsHistory[post.statsHistory.length - 1];
      return {
         //@ts-ignore
        date: latestStats.scrapedAt.toISOString().split('T')[0],
         //@ts-ignore
        likes: latestStats.likeCount,
         //@ts-ignore
        comments: latestStats.commentCount,
         //@ts-ignore
        views: latestStats.viewCount || 0,
        postUrl: post.postUrl,
      };
    });
  } catch (error) {
    console.error('Error getting post performance:', error);
    return [];
  }
};