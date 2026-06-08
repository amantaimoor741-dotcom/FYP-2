import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseDocument } from '../services/documentParser.ts';
import type { AuthRequest } from '../middleware/auth.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { createDocument, getDocument } from '../services/db/documents.ts';
import { storage, getUploadPath } from '../services/storage.ts';

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: PDF, DOCX, TXT, MD'));
  },
});

router.post('/upload', authMiddleware, (req: AuthRequest, res: any) => {
  upload.single('document')(req, res, async (err) => {
    if (err) { res.status(400).json({ error: 'Upload Error', message: err.message }); return; }
    if (!req.file) { res.status(400).json({ error: 'Bad Request', message: 'No file provided' }); return; }

    const storageKey = getUploadPath(req.file.filename);
    const doc = await createDocument({
      userId: req.userId!,
      originalName: req.file.originalname,
      storageKey,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({ document: doc });
  });
});

router.get('/:id/content', authMiddleware, async (req: AuthRequest, res: any) => {
  const doc = await getDocument(req.params.id);
  if (!doc || doc.userId !== req.userId) {
    res.status(404).json({ error: 'Not Found', message: 'Document not found' });
    return;
  }

  const filePath = path.join(process.cwd(), 'data', doc.storageKey);
  if (!fs.existsSync(filePath)) {
    res.status(400).json({ error: 'Bad Request', message: 'Document file not found on server' });
    return;
  }

  try {
    const text = await parseDocument(filePath, doc.mimeType);
    res.json({ text, document: doc });
  } catch (err: any) {
    res.status(500).json({ error: 'Parse Error', message: err.message });
  }
});

export default router;
