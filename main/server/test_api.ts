import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const { default: documentRoutes } = await import('./routes/documents.ts');
const { default: generateRoutes } = await import('./routes/generate.ts');
const { default: projectRoutes } = await import('./routes/projects.ts');
const { default: adminRoutes } = await import('./routes/admin.ts');

app.use('/api/documents', documentRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', mode: process.env.NODE_ENV || 'development' });
});

const PORT = 4001; // use different port to avoid conflicts
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Test server on :${PORT}`);
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e: any) {
      console.log(`  ✗ ${name}: ${e.message}`);
      failed++;
    }
  }

  const BASE = `http://localhost:${PORT}`;

  await test('GET /api/health returns ok', async () => {
    const res = await fetch(`${BASE}/api/health`).then(r => r.json());
    if (res.status !== 'ok') throw new Error('Expected ok');
  });

  await test('POST /api/documents/upload - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/documents/upload`, { method: 'POST' });
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/documents/:id/content - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/documents/foo/content`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('POST /api/generate - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/generate/:id/status - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/generate/foo/status`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/generate/:id/result - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/generate/foo/result`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/projects - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/projects`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/projects/:id - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/projects/foo`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('DELETE /api/projects/:id - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/projects/foo`, { method: 'DELETE' });
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/admin/stats - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/admin/stats`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  await test('GET /api/admin/logs - no auth returns 401', async () => {
    const res = await fetch(`${BASE}/api/admin/logs`);
    if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
  });

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
