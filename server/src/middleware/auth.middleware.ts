import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


interface AuthRequest extends Request {
  user?: any; 
}

interface JwtPayload {
  userId: string;
}

const protectRoute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace(/^Bearer\s+/, '');

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (err) {
      console.error('JWT verification failed:', (err as Error).message);
      return res.status(401).json({ error: 'Token is not valid' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('protectRoute error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default protectRoute;