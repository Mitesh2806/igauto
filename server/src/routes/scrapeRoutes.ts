import { Router } from 'express';
import type { Request, Response } from 'express';
import protectRoute from '../middleware/auth.middleware.js';
import { scrapeInstagramProfile } from '../lib/scraper-gq.js';
import { saveScrapedData } from '../service/dbService.js';
import { 
  calculateProfileStats, 
  getGrowthData, 
  getPostPerformance 
} from '../service/statsService.js';
import { 
  analyzeAudienceDemographics, 
  analyzeImage 
} from '../service/aiService.js';


interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    instaHandle: string;
  };
}

const router = Router();

/**
 * A centralized handler to perform the entire scrape-to-stats pipeline.
 * @param username The Instagram username to process.
 * @param userId The ID of the app user initiating the request.
 * @param res The Express response object.
 */
const handleScrapeAndAnalyze = async (username: string, userId: string, res: Response) => {
  try {
 
    const scrapedData = await scrapeInstagramProfile(username);
    if (!scrapedData) {
      return res.status(404).json({ error: 'Profile does not exist or is private.' });
    }

 
    console.log(`[AI Integration]: Starting AI analysis for ${username}...`);
    

    const demographics = await analyzeAudienceDemographics(scrapedData);

   
    const analyzedPosts = await Promise.all(
      scrapedData.recentPosts.map(async (post) => {
        const aiAnalysis = await analyzeImage(post.imageUrl);
        return { ...post, aiAnalysis }; 
      })
    );

    
    const finalData = {
      ...scrapedData,
      recentPosts: analyzedPosts,
      audienceDemographics: demographics,
    };
    

    await saveScrapedData(finalData, userId as any);


    const stats = await calculateProfileStats(username, userId as any);
    const growthData = await getGrowthData(username, userId as any);
    const postPerformance = await getPostPerformance(username, userId as any);


    return res.status(200).json({
      profile: finalData,
      analytics: {
        stats,
        growthData,
        postPerformance,
      },
    });

  } catch (error) {
    console.error(`[Scrape Route Error]: Failed to process profile for ${username}:`, error);
    res.status(500).json({ error: 'An internal server error occurred while processing the profile.' });
  }
};


//@ts-ignore
router.get('/profile', protectRoute, async (req: AuthenticatedRequest, res: Response) => {
  const username = req.user?.instaHandle;
  const userId = req.user?.id;

  if (!username || !userId) {
    return res.status(401).json({ error: 'Authentication error: User information not found.' });
  }
  await handleScrapeAndAnalyze(username, userId, res);
});

//@ts-ignore
router.get('/profile/:username', protectRoute, async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication error: User not found.' });
  }
  //@ts-ignore
  await handleScrapeAndAnalyze(username.replace('@', ''), userId, res);
});

export default router;