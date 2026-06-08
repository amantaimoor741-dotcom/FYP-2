import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  file?: Express.Multer.File;
}

const DEMO_USER_ID = 'demo_user_001';

function extractUserIdFromToken(token: string): string | null {
  const parts = token.split('_');
  // demo_token_{userId}_{ts}_{rand}  ->  parts = ['demo', 'token', userId, ts, rand]
  if (parts.length >= 3) {
    return parts[2] || null;
  }
  return null;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];

  if (token.startsWith('demo_token_')) {
    const userId = extractUserIdFromToken(token);
    req.userId = userId || DEMO_USER_ID;
    req.userRole = userId === DEMO_USER_ID ? 'admin' : 'user';
    next();
    return;
  }

  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      res.status(500).json({ error: 'Server Error', message: 'Clerk secret key not configured' });
      return;
    }
    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties: ['http://localhost:3000'],
    });
    req.userId = payload.sub;
    req.userRole = 'user';
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    return;
  }
  next();
}
