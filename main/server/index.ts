import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

import documentRoutes from './routes/documents.js';
import generateRoutes from './routes/generate.js';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', mode: process.env.NODE_ENV || 'development' });
});

export default app;

const isServerless = !!(process.env.FUNCTION_NAME || process.env.K_SERVICE || process.env.KOYEB_SERVICE_NAME);
const DATA_DIR = path.join(
  isServerless ? os.tmpdir() : process.cwd(),
  'data'
);
const generatedDir = path.join(DATA_DIR, 'generated');

// Serve generated previews (works in all environments)
app.use('/preview', express.static(generatedDir));

// Only listen directly when running standalone (not in Firebase or Koyeb)
if (!isServerless) {
  // Serve frontend in production
  const frontendDist = path.join(process.cwd(), 'dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  const PORT = parseInt(process.env.PORT || process.env.SERVER_PORT || '4000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 DocuWeb AI Server running on http://localhost:${PORT}`);
    console.log(`  📄 API: http://localhost:${PORT}/api/health\n`);
  });
}


