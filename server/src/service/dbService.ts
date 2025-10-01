import mongoose from 'mongoose';
import ScrapedProfile from '../models/ScrappedProfile.js';
import Post from '../models/Post.js';
import User from '../models/User.js';


/**
 * Saves or updates a scraped Instagram profile and its recent posts in the database.
 * This function now expects the data to be pre-enriched with AI analysis.
 *
 * @param augmentedData The enriched data object containing scrape info and AI analysis.
 * @param trackedByUserId The ID of the application user who initiated the scrape.
 */
export const saveScrapedData = async (
  augmentedData: any, // This object now contains scrapedData + AI data
  trackedByUserId: mongoose.Types.ObjectId
) => {
  console.log(`[DB Service]: Saving data for profile: ${augmentedData.username}`);
  try {
    // --- Step 1: Find or Create the ScrapedProfile document ---

    const profileStats = {
      followerCount: augmentedData.followers,
      followingCount: augmentedData.following,
      postCount: augmentedData.postsCount,
      scrapedAt: new Date(),
    };

    // Use findOneAndUpdate with 'upsert' to create or update the profile.
    const profile = await ScrapedProfile.findOneAndUpdate(
      { username: augmentedData.username, trackedBy: trackedByUserId },
      {
        $set: { // Fields to set or update on every scrape
          fullName: augmentedData.fullName,
          profilePictureUrl: augmentedData.profilePictureUrl,
          // Save the new AI-generated audience demographics
          audienceDemographics: augmentedData.audienceDemographics,
        },
        $push: { statsHistory: profileStats }, // Add a new snapshot to the history
      },
      { upsert: true, new: true } // `upsert` creates if it doesn't exist, `new` returns the updated document.
    );

    // --- Step 2: Link the ScrapedProfile to the User who tracks it ---
    // Use $addToSet to prevent adding duplicate profile IDs to the user's list.
    await User.findByIdAndUpdate(trackedByUserId, {
      $addToSet: { trackedProfile: profile._id },
    });

    // --- Step 3: Process and Save/Update each Post and Reel ---
    const allPosts = [...augmentedData.recentPosts, ...augmentedData.recentReels];

    for (const postData of allPosts) {
      if (!postData) continue; // Skip if postData is null or undefined

      // Extract the unique shortcode from the post URL
      const shortcode = postData.postUrl?.split('/p/')[1]?.replace('/', '');
      if (!shortcode) continue; // Skip if URL is malformed

      const postStats = {
        likeCount: postData.likes,
        commentCount: postData.comments,
        viewCount: postData.views,
        scrapedAt: new Date(),
      };
      
      // Use findOneAndUpdate for posts as well, identified by their unique shortcode
      await Post.findOneAndUpdate(
        { shortcode: shortcode },
        {
          $set: {
            profileId: profile._id, // Link the post to the ScrapedProfile document
            postUrl: postData.postUrl,
            authorUsername: augmentedData.username,
            caption: postData.caption,
            mediaType: postData.contentType === 'Image' ? 'Image' : postData.contentType === 'Carousel' ? 'Carousel' : 'Video',
            displayUrl: postData.imageUrl,
            // Save the new AI-generated image analysis
            aiAnalysis: postData.aiAnalysis,
          },
          $push: { statsHistory: postStats }, // Add new stats to the post's history
        },
        { upsert: true }
      );
    }
    console.log(`[DB Service]: Successfully saved data for ${augmentedData.username}`);
  } catch (error) {
    console.error('[DB Service]: Error saving scraped data:', error);
    // Optionally re-throw the error to be handled by the calling route
    throw error;
  }
};