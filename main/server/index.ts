import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import documentRoutes from './routes/documents.ts';
import generateRoutes from './routes/generate.ts';
import projectRoutes from './routes/projects.ts';
import adminRoutes from './routes/admin.ts';
import contactRoutes from './routes/contact.ts';
import settingsRoutes from './routes/settings.ts';
import authRoutes from './routes/auth.ts';

const app = express();
const PORT = parseInt(process.env.PORT || process.env.SERVER_PORT || '4000', 10);

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

// Serve generated previews
const generatedDir = path.join(process.cwd(), 'data', 'generated');
app.use('/preview', express.static(generatedDir));

// Serve frontend in production
const frontendDist = path.join(process.cwd(), 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🚀 DocuWeb AI Server running on http://localhost:${PORT}`);
  console.log(`  📄 API: http://localhost:${PORT}/api/health\n`);
});


