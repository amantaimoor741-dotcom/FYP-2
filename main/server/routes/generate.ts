import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { parseDocument } from '../services/documentParser.js';
import { analyzeDocument } from '../services/geminiEngine.js';
import { classifyDomain, inferMissingRequirements } from '../services/reasoningEngine.js';
import type { GenerationConfig } from '../services/codeGenerator.js';
import { generateFullApp } from '../services/codeGenerator.js';
import { generateWebsiteHTML } from '../services/geminiEngine.js';
import { createProject, getProject, updateProject } from '../services/db/projects.js';
import { getDocument } from '../services/db/documents.js';
import { getDataDir } from '../services/storage.js';

const router = Router();
const DATA_DIR = getDataDir();

router.post('/', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const { documentId, projectName, theme, config: genConfig, model } = req.body;
    if (!documentId) { res.status(400).json({ error: 'Bad Request', message: 'documentId required' }); return; }

    const doc = await getDocument(documentId);
    if (!doc) { res.status(404).json({ error: 'Not Found', message: 'Document not found' }); return; }

    const filePath = path.join(DATA_DIR, doc.storageKey);
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
    ? `/preview/${project.id}/preview.html`
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
    const OUTPUT_DIR = path.join(DATA_DIR, 'generated', projectId);
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Generate AI-powered website
    try {
      const html = await generateWebsiteHTML(text, modelId);
      const previewPath = path.join(OUTPUT_DIR, 'preview.html');
      fs.writeFileSync(previewPath, html);
      await updateProject(projectId, { status: 'completed', outputPath: previewPath });
    } catch (aiErr: any) {
      console.error('AI generation failed, falling back to template:', aiErr.message);
      // Fallback to template-based generation
      const project = await getProject(projectId);
      const theme = project?.theme || 'modern';
      const config = project?.config ? JSON.parse(project.config) : {};
      const genConfig: GenerationConfig = { theme, ...config };
      const zipPath = await generateFullApp(analysis, projectId, path.join(DATA_DIR, 'generated'), genConfig);
      await updateProject(projectId, { status: 'completed', outputPath: zipPath });
    }
  } catch (err: any) {
    await updateProject(projectId, { status: 'failed', error: err.message });
  }
}

export default router;
