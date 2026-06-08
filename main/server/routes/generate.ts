import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { AuthRequest } from '../middleware/auth.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { parseDocument } from '../services/documentParser.ts';
import { analyzeDocument } from '../services/geminiEngine.ts';
import { classifyDomain, inferMissingRequirements } from '../services/reasoningEngine.ts';
import type { GenerationConfig } from '../services/codeGenerator.ts';
import { generateFullApp } from '../services/codeGenerator.ts';
import { createProject, getProject, updateProject } from '../services/db/projects.ts';
import { getDocument } from '../services/db/documents.ts';

const router = Router();
const DATA_DIR = path.join(process.cwd(), 'data');

router.post('/', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const { documentId, projectName, theme, config: genConfig, model } = req.body;
    if (!documentId) { res.status(400).json({ error: 'Bad Request', message: 'documentId required' }); return; }

    const doc = await getDocument(documentId);
    if (!doc) { res.status(404).json({ error: 'Not Found', message: 'Document not found' }); return; }

    const filePath = path.join(process.cwd(), 'data', doc.storageKey);
    if (!fs.existsSync(filePath)) { res.status(400).json({ error: 'Bad Request', message: 'Document file not found' }); return; }

    const project = await createProject({
      name: projectName || doc.originalName.replace(/\.[^/.]+$/, ''),
      userId: req.userId!,
      documentType: path.extname(doc.originalName).toLowerCase(),
      theme: theme || 'modern',
      config: { ...(genConfig || {}), model: model || 'openai/gpt-4o-mini' },
    });

    processDocument(filePath, doc.mimeType, project.id, model).catch(err => {
      console.error('Processing failed for', project.id, err.message);
      updateProject(project.id, { status: 'failed', error: err.message });
    });

    res.status(202).json({ projectId: project.id, status: 'processing' });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Error', message: err.message });
  }
});

router.get('/:id/status', authMiddleware, async (req: AuthRequest, res: any) => {
  const project = await getProject(req.params.id);
  if (!project || project.userId !== req.userId) { res.status(404).json({ error: 'Not Found', message: 'Project not found' }); return; }
  res.json({ id: project.id, status: project.status, name: project.name, error: project.error });
});

router.get('/:id/result', authMiddleware, async (req: AuthRequest, res: any) => {
  const project = await getProject(req.params.id);
  if (!project || project.userId !== req.userId) { res.status(404).json({ error: 'Not Found', message: 'Project not found' }); return; }
  if (project.status !== 'completed') { res.status(400).json({ error: 'Not Ready', message: `Project is ${project.status}` }); return; }
  const analysis = project.config ? JSON.parse(project.config) : {};
  const previewUrl = project.outputPath
    ? `/preview/${path.basename(project.outputPath, '.zip')}/preview.html`
    : null;
  res.json({ ...project, documentAnalysis: analysis, previewUrl });
});

async function processDocument(filePath: string, mimeType: string, projectId: string, modelId?: string) {
  try {
    await updateProject(projectId, { status: 'analyzing' });
    const text = await parseDocument(filePath, mimeType);
    const analysis = await analyzeDocument(text, modelId);
    await updateProject(projectId, { config: analysis });

    await updateProject(projectId, { status: 'reasoning' });
    const domain = classifyDomain(text);
    const missingFeatures = inferMissingRequirements(analysis);
    analysis.domain = domain;
    analysis.missingFeatures = missingFeatures;
    await updateProject(projectId, { config: analysis });

    await updateProject(projectId, { status: 'generating' });
    const project = await getProject(projectId);
    const theme = project?.theme || 'modern';
    const config = project?.config ? JSON.parse(project.config) : {};
    const genConfig: GenerationConfig = { theme, ...config };
    const OUTPUT_DIR = path.join(DATA_DIR, 'generated');
    const zipPath = await generateFullApp(analysis, projectId, OUTPUT_DIR, genConfig);

    await updateProject(projectId, { status: 'completed', outputPath: zipPath });
  } catch (err: any) {
    await updateProject(projectId, { status: 'failed', error: err.message });
  }
}

export default router;
