// src/types/express.d.ts

import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string; // Or mongoose.Types.ObjectId if that's what your token stores
      };
    }
    export interface User {
    id: string;
    instaHandle: string;
    email: string;
    // Add any other properties from your User model that you want to access on req.user
  }
  }
}