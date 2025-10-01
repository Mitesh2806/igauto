// src/routes/statsRoutes.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import protectRoute from '../middleware/auth.middleware.js';
import {
  calculateProfileStats,
  getGrowthData,
  getPostPerformance,
} from '../service/statsService.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    instaHandle: string;
  };
}

const router = Router();

// Get statistics for a profile
//@ts-ignore
router.get('/:username', protectRoute, async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    //@ts-ignore
    const stats = await calculateProfileStats(username.replace('@', ''), userId as any);
     //@ts-ignore
    const growthData = await getGrowthData(username.replace('@', ''), userId as any);
     //@ts-ignore
    const postPerformance = await getPostPerformance(username.replace('@', ''), userId as any);

    if (!stats) {
      return res.status(404).json({ error: 'Profile statistics not found' });
    }

    return res.status(200).json({
      stats,
      growthData,
      postPerformance,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;