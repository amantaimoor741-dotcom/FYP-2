import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { getUserProjects, getProject, deleteProject } from '../services/db/projects.js';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: any) => {
  const projects = await getUserProjects(req.userId!);
  res.json({ projects });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  const project = await getProject(req.params.id);
  if (!project || project.userId !== req.userId) {
    res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    return;
  }
  res.json({ project });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: any) => {
  const project = await getProject(req.params.id);
  if (!project || project.userId !== req.userId) {
    res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    return;
  }
  await deleteProject(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/:id/download', authMiddleware, async (req: AuthRequest, res: any) => {
  const project = await getProject(req.params.id);
  if (!project || project.userId !== req.userId) {
    res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    return;
  }
  if (!project.outputPath || !fs.existsSync(project.outputPath)) {
    res.status(400).json({ error: 'Not Found', message: 'No ZIP available' });
    return;
  }
  const zipPath = project.outputPath!;
  const name = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  res.download(zipPath, `${name}.zip`);
});

export default router;
