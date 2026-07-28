import { Router } from 'express';
import os from 'os';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { getProjectStats, getAllProjects } from '../services/db/projects.js';
import { getUsageStats } from '../services/db/users.js';

const router = Router();

router.use(authMiddleware);

router.get('/stats', async (_req: AuthRequest, res: any) => {
  const [stats, usage] = await Promise.all([getProjectStats(), getUsageStats()]);
  res.json({
    stats: {
      ...stats,
      ...usage,
      systemUptime: Math.floor(os.uptime()),
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
});

router.get('/logs', async (_req: AuthRequest, res: any) => {
  const projects = await getAllProjects();
  const logs = projects.slice(0, 50).map((p: any) => ({
    id: p.id, name: p.name, status: p.status, type: p.documentType,
    createdAt: p.createdAt, error: p.error,
  }));
  res.json({ logs });
});

export default router;
