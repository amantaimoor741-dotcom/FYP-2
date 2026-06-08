import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, '..');
process.chdir(WORKSPACE);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const { default: documentRoutes } = await import('./routes/documents.ts');
const { default: generateRoutes } = await import('./routes/generate.ts');
const { default: projectRoutes } = await import('./routes/projects.ts');
const { default: adminRoutes } = await import('./routes/admin.ts');
const { default: contactRoutes } = await import('./routes/contact.ts');
const { default: settingsRoutes } = await import('./routes/settings.ts');

app.use('/api/documents', documentRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const server = app.listen(4000, '0.0.0.0', async () => {
  console.log('Server started on :4000');

  const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
  const USER_ID = 'user_3EZrUT12CXtNJ5rWwepOtq38uhG';

  try {
    // Get Clerk token
    const s = await (await fetch('https://api.clerk.com/v1/sessions', { method:'POST', headers:{Authorization:'Bearer '+CLERK_SECRET,'Content-Type':'application/json'}, body:JSON.stringify({user_id:USER_ID})})).json();
    const t = await (await fetch('https://api.clerk.com/v1/sessions/'+s.id+'/tokens', { method:'POST', headers:{Authorization:'Bearer '+CLERK_SECRET,'Content-Type':'application/json'}, body:JSON.stringify({expires_in_seconds:3600})})).json();
    const TOKEN = t.jwt;

    // 1. Upload
    console.log('\n=== STEP 1: Upload ===');
    const form = new FormData();
    const docText = fs.readFileSync('data/uploads/doc-e2e.txt', 'utf-8');
    form.append('document', new Blob([docText], {type:'text/plain'}), 'doc-e2e.txt');
    const up = await (await fetch('http://localhost:4000/api/documents/upload', {method:'POST', headers:{Authorization:'Bearer '+TOKEN}, body:form})).json();
    if (!up.document?.id) { throw new Error('Upload failed: '+JSON.stringify(up)); }
    console.log('  Doc ID:', up.document.id);

    // 2. Generate
    console.log('\n=== STEP 2: Generate ===');
    const gen = await (await fetch('http://localhost:4000/api/generate', {method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN}, body:JSON.stringify({documentId:up.document.id,projectName:'E-Commerce App',theme:'modern',config:{headings:true,nav:true,images:false,seo:true}})})).json();
    if (!gen.projectId) { throw new Error('Generate failed: '+JSON.stringify(gen)); }
    console.log('  Project ID:', gen.projectId);

    // 3. Poll
    console.log('\n=== STEP 3: Poll ===');
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await (await fetch('http://localhost:4000/api/generate/'+gen.projectId+'/status', {headers:{Authorization:'Bearer '+TOKEN}})).json();
      process.stdout.write('  ['+((i+1)*5)+'s] '+status.status+(status.error?': '+status.error.substring(0,200):'')+'\n');
      if (status.status === 'completed') {
        const result = await (await fetch('http://localhost:4000/api/generate/'+gen.projectId+'/result', {headers:{Authorization:'Bearer '+TOKEN}})).json();
        console.log('\n✅ PIPELINE SUCCESS');
        console.log('  Title:', result.documentAnalysis?.title);
        console.log('  Domain:', result.documentAnalysis?.domain);
        console.log('  Entities:', result.documentAnalysis?.entities?.length);
        console.log('  ZIP:', result.outputPath);
        if (result.outputPath && fs.existsSync(result.outputPath)) {
          console.log('  Size:', (fs.statSync(result.outputPath).size/1024).toFixed(1)+' KB');
        }
        server.close();
        process.exit(0);
      }
      if (status.status === 'failed') {
        throw new Error(status.error);
      }
    }
    throw new Error('Poll timeout');
  } catch (err) {
    console.error('\n❌', err.message);
    if (err.message && fs.existsSync('data/server.log')) {
      const log = fs.readFileSync('data/server.log', 'utf-8');
      const lines = log.split('\n').filter(l => l.includes('error') || l.includes('Error') || l.includes('OpenRouter')).slice(-10);
      if (lines.length) console.log('Recent errors:\n'+lines.join('\n'));
    }
    server.close();
    process.exit(1);
  }
});
