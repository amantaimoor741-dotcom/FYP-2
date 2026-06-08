import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { getSettings, updateSettings } from '../services/db/settings.ts';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: any) => {
  const settings = await getSettings(req.userId!);
  res.json({ settings });
});

router.put('/', authMiddleware, async (req: AuthRequest, res: any) => {
  await updateSettings(req.userId!, req.body);
  const settings = await getSettings(req.userId!);
  res.json({ settings });
});

export default router;
