import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  file?: Express.Multer.File;
}

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];

  // Verify our own JWT tokens
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    req.userRole = 'user';
    next();
    return;
  } catch {
    // Not our token — fall through to Clerk
  }

  // Fallback: verify Clerk token if configured
  try {
    const { verifyToken } = await import('@clerk/backend');
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
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
