import fs from 'fs';
import path from 'path';
import type { DocumentAnalysis } from '../types/index.ts';
import type { ThemeOption } from './uiGenerator.ts';
import { generateWireframes, generateDesignSystem } from './uiGenerator.ts';

export interface GenerationConfig {
  theme?: ThemeOption;
  detectHierarchies?: boolean;
  autoNavigation?: boolean;
  extractImages?: boolean;
  metaOptimization?: boolean;
}

export async function generateFullApp(
  analysis: DocumentAnalysis,
  projectId: string,
  outputDir: string,
  config?: GenerationConfig
): Promise<string> {
  const appDir = path.join(outputDir, projectId);
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const wireframes = generateWireframes(analysis);
  const designSystem = generateDesignSystem(analysis.domain, config?.theme);

  const frontendDir = path.join(appDir, 'frontend');
  generateFrontend(frontendDir, analysis, wireframes, designSystem);

  const backendDir = path.join(appDir, 'backend');
  generateBackend(backendDir, analysis);

  generateDatabaseSchema(appDir, analysis);
  generateDeploymentConfig(appDir);
  generatePackageJsons(appDir, analysis);

  generatePreviewHtml(appDir, analysis, wireframes, designSystem);

  const zipPath = path.join(outputDir, `${projectId}.zip`);
  await zipDirectory(appDir, zipPath);

  return zipPath;
}

function generateFrontend(dir: string, analysis: DocumentAnalysis, wireframes: any[], designSystem: any) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(dir, 'src'))) fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  if (!fs.existsSync(path.join(dir, 'src', 'pages'))) fs.mkdirSync(path.join(dir, 'src', 'pages'), { recursive: true });
  if (!fs.existsSync(path.join(dir, 'src', 'components'))) fs.mkdirSync(path.join(dir, 'src', 'components'), { recursive: true });

  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${analysis.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>window.global = window;</script>
  </body>
</html>`);

  fs.writeFileSync(path.join(dir, 'vite.config.ts'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000, host: '0.0.0.0' },
});`);

  fs.writeFileSync(path.join(dir, 'src', 'main.tsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`);

  fs.writeFileSync(path.join(dir, 'src', 'index.css'), `@import "tailwindcss";

@theme {
  --color-primary: ${designSystem.colors.primary};
  --color-secondary: ${designSystem.colors.secondary};
  --color-accent: ${designSystem.colors.accent};
  --color-background: ${designSystem.colors.background};
  --color-surface: ${designSystem.colors.surface};
  --color-text: ${designSystem.colors.text};
  --font-heading: '${designSystem.typography.heading}', sans-serif;
  --font-body: '${designSystem.typography.body}', sans-serif;
  --radius-box: ${designSystem.borderRadius};
}

body {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-text);
  margin: 0;
}`);

  const features = analysis.features.length > 0 ? analysis.features : [];
  const forms = analysis.forms && analysis.forms.length > 0 ? analysis.forms : [];
  const entities = analysis.entities && analysis.entities.length > 0 ? analysis.entities : [];
  const workflows = analysis.workflows && analysis.workflows.length > 0 ? analysis.workflows : [];

  const pageNames: string[] = ['dashboard'];
  if (features.length > 0) pageNames.push('features');
  if (entities.length > 0) pageNames.push('entities');
  if (forms.length > 0) pageNames.push('forms');
  if (workflows.length > 0) pageNames.push('workflows');

  const navItems = pageNames.map(p => {
    const label = p.charAt(0).toUpperCase() + p.slice(1);
    return `          <button onClick={() => setPage('${p}')} className={\`text-sm transition-colors \${page === '${p}' ? 'text-primary font-semibold' : 'hover:text-primary'}\`}>${label}</button>`;
  }).join('\n');

  fs.writeFileSync(path.join(dir, 'src', 'App.tsx'), `import { useState } from 'react';

const features = ${JSON.stringify(features)};
const forms = ${JSON.stringify(forms)};
const entities = ${JSON.stringify(entities)};
const workflows = ${JSON.stringify(workflows)};

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background text-text">
      <nav className="bg-surface border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-heading font-bold text-primary">${analysis.title}</h1>
        <div className="flex gap-4">
${navItems}
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        {page === 'dashboard' && <Dashboard />}
        ${features.length > 0 ? "{page === 'features' && <Features />}" : ''}
        ${entities.length > 0 ? "{page === 'entities' && <EntityManager />}" : ''}
        ${forms.length > 0 ? "{page === 'forms' && <Forms />}" : ''}
        ${workflows.length > 0 ? "{page === 'workflows' && <Workflows />}" : ''}
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Features" value={String(features.length)} />
        <StatCard title="Data Entities" value={String(entities.length)} />
        <StatCard title="Forms" value={String(forms.length)} />
      </div>
      <div className="bg-surface rounded-xl p-6 border border-white/10 mb-6">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <p className="text-white/80">${analysis.description || 'Generated from document analysis'}</p>
      </div>
      ${features.length > 0 ? `
      <div className="bg-surface rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          ${features.slice(0, 4).map((f: string) => `<button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors">${f}</button>`).join('\n          ')}
        </div>
      </div>` : ''}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-surface rounded-xl p-6 border border-white/10">
      <p className="text-white/60 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

${features.length > 0 ? `
function Features() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Features</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f: string, i: number) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-white/10 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary font-bold">{String(i + 1).padStart(2, '0')}</div>
            <p className="font-medium">{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
` : ''}

${entities.length > 0 ? `
function EntityManager() {
  const [selected, setSelected] = useState(entities[0]?.name || '');
  const entity = entities.find((e: any) => e.name === selected);

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Data Entities</h2>
      <div className="flex gap-2 mb-6 flex-wrap">
        {entities.map((e: any) => (
          <button key={e.name} onClick={() => setSelected(e.name)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
              selected === e.name ? 'bg-primary text-white' : 'bg-surface border border-white/10 hover:border-primary/50'
            }\`}
          >
            {e.name}
          </button>
        ))}
      </div>
      {entity && (
        <div className="bg-surface rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-heading font-bold mb-4">{entity.name}</h3>
          {entity.relations?.length > 0 && (
            <div className="flex gap-2 mb-4">
              {entity.relations.map((r: any, i: number) => (
                <span key={i} className="px-2 py-1 rounded text-xs bg-accent/10 text-accent border border-accent/20">rel: {r.target}</span>
              ))}
            </div>
          )}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 font-medium text-white/60">Property</th>
                <th className="pb-3 font-medium text-white/60">Type</th>
                <th className="pb-3 font-medium text-white/60">Required</th>
              </tr>
            </thead>
            <tbody>
              {entity.properties.map((p: any) => (
                <tr key={p.name} className="border-b border-white/5">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3 text-white/60">{p.type}</td>
                  <td className="py-3">{p.required ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
` : ''}

${forms.length > 0 ? `
function Forms() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Forms</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {forms.map((f: any, i: number) => (
          <div key={i} className="bg-surface rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-heading font-bold mb-4">{f.name}</h3>
            <div className="space-y-3">
              {f.fields?.length > 0 ? f.fields.map((field: any, j: number) => (
                <div key={j}>
                  <label className="block text-sm text-white/60 mb-1">{field.label || field.name}</label>
                  <input type={field.type || 'text'} placeholder={field.placeholder || ''} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50" />
                </div>
              )) : <p className="text-white/40 text-sm">No fields defined</p>}
              <button className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Submit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
` : ''}

${workflows.length > 0 ? `
function Workflows() {
  const [active, setActive] = useState(workflows[0]?.name || '');
  const workflow = workflows.find((w: any) => w.name === active);
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Workflows</h2>
      <div className="flex gap-2 mb-6 flex-wrap">
        {workflows.map((w: any) => (
          <button key={w.name} onClick={() => setActive(w.name)}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
              active === w.name ? 'bg-primary text-white' : 'bg-surface border border-white/10 hover:border-primary/50'
            }\`}
          >
            {w.name}
          </button>
        ))}
      </div>
      {workflow && (
        <div className="bg-surface rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            {workflow.steps?.length > 0 ? workflow.steps.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">{i + 1}</div>
                <span className="text-sm">{typeof s === 'string' ? s : s.name || s.action || s.description || 'Step'}</span>
                {i < workflow.steps.length - 1 && <div className="w-8 h-px bg-white/20" />}
              </div>
            )) : <p className="text-white/40 text-sm">No steps defined</p>}
          </div>
        </div>
      )}
    </div>
  );
}
` : ''}`);
}

function generateBackend(dir: string, analysis: DocumentAnalysis) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(dir, 'src'))) fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  if (!fs.existsSync(path.join(dir, 'src', 'routes'))) fs.mkdirSync(path.join(dir, 'src', 'routes'), { recursive: true });

  fs.writeFileSync(path.join(dir, 'src', 'index.ts'), `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

${analysis.entities.map(e => `import ${e.name.toLowerCase()}Routes from './routes/${e.name.toLowerCase()}.ts';`).join('\n')}

${analysis.entities.map(e => `app.use('/api/${e.name.toLowerCase()}s', ${e.name.toLowerCase()}Routes);`).join('\n')}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`);

  for (const entity of analysis.entities) {
    const name = entity.name;
    const lname = name.toLowerCase();
    fs.writeFileSync(path.join(dir, 'src', 'routes', `${lname}.ts`), `import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.json({ data: [], message: 'List of ${lname}s' });
});

router.get('/:id', (req, res) => {
  res.json({ data: null, message: \`Get \${req.params.id}\` });
});

router.post('/', (req, res) => {
  res.status(201).json({ data: req.body, message: 'Created' });
});

router.put('/:id', (req, res) => {
  res.json({ data: req.body, message: \`Updated \${req.params.id}\` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: \`Deleted \${req.params.id}\` });
});

export default router;`);
  }

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: `${analysis.title.toLowerCase().replace(/\s+/g, '-')}-api`,
    version: '1.0.0',
    type: 'module',
    scripts: { dev: 'tsx watch src/index.ts', build: 'tsc', start: 'node dist/index.js' },
    dependencies: { express: '^4.21.0', cors: '^2.8.5', dotenv: '^16.4.0', '@prisma/client': '^5.0.0' },
    devDependencies: { typescript: '~5.8.0', tsx: '^4.19.0', '@types/express': '^4.17.21', '@types/cors': '^2.8.17', prisma: '^5.0.0' },
  }, null, 2));

  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', outDir: './dist', rootDir: './src', strict: true, esModuleInterop: true, skipLibCheck: true },
    include: ['src'],
  }, null, 2));
}

function generateDatabaseSchema(dir: string, analysis: DocumentAnalysis) {
  const prismaDir = path.join(dir, 'prisma');
  if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });

  let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

  for (const entity of analysis.entities) {
    schema += `model ${entity.name} {\n`;
    schema += `  id        String   @id @default(cuid())\n`;
    schema += `  createdAt DateTime @default(now())\n`;
    schema += `  updatedAt DateTime @updatedAt\n`;

    for (const prop of entity.properties) {
      const isOptional = !prop.required;
      const prismaType = mapToPrismaType(prop.type);
      schema += `  ${prop.name} ${prismaType}${isOptional ? '?' : ''}\n`;
    }

    for (const rel of entity.relations) {
      const targetLower = rel.target.toLowerCase();
      schema += `  ${targetLower}Id String?\n`;
      schema += `  ${targetLower} ${rel.target}? @relation(fields: [${targetLower}Id], references: [id])\n`;
    }

    schema += `}\n\n`;
  }

  fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), schema);
  fs.writeFileSync(path.join(dir, '.env'), 'DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\n');
}

function generateDeploymentConfig(dir: string) {
  fs.writeFileSync(path.join(dir, 'Dockerfile'), `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]`);

  fs.writeFileSync(path.join(dir, 'docker-compose.yml'), `version: '3.8'
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`);

  fs.writeFileSync(path.join(dir, '.gitignore'), `node_modules/
dist/
.env
*.log`);
}

function generatePackageJsons(dir: string, analysis: DocumentAnalysis) {
  const safeName = analysis.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: safeName,
      private: true,
      version: '1.0.0',
      scripts: {
        dev: 'cd frontend && npm run dev',
        build: 'cd frontend && npm run build',
        'install:all': 'cd frontend && npm install && cd ../backend && npm install',
      },
    }, null, 2));
  }

  fs.writeFileSync(path.join(dir, 'frontend', 'package.json'), JSON.stringify({
    name: `${safeName}-frontend`,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: { dev: 'vite --port=3000 --host=0.0.0.0', build: 'vite build', preview: 'vite preview' },
    dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0', 'lucide-react': '^0.546.0' },
    devDependencies: { '@vitejs/plugin-react': '^5.0.0', '@tailwindcss/vite': '^4.1.0', tailwindcss: '^4.1.0', vite: '^6.2.0', typescript: '~5.8.0' },
  }, null, 2));
}

function mapToPrismaType(propType: string): string {
  const t = propType.toLowerCase();
  if (t.includes('string') || t.includes('text') || t.includes('email') || t.includes('url') || t.includes('name') || t.includes('title') || t.includes('description')) return 'String';
  if (t.includes('number') || t.includes('int') || t.includes('count') || t.includes('price') || t.includes('amount')) return 'Int';
  if (t.includes('boolean') || t.includes('bool') || t.includes('is') || t.includes('has') || t.includes('active')) return 'Boolean';
  if (t.includes('date') || t.includes('time')) return 'DateTime';
  if (t.includes('float') || t.includes('decimal') || t.includes('double')) return 'Float';
  return 'String';
}

async function zipDirectory(sourceDir: string, outPath: string): Promise<string> {
  const { ZipArchive } = await import('archiver');
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve(outPath));
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

function generatePreviewHtml(dir: string, analysis: DocumentAnalysis, wireframes: any[], designSystem: any) {
  const features = analysis.features && analysis.features.length > 0 ? analysis.features : [];
  const entities = analysis.entities && analysis.entities.length > 0 ? analysis.entities : [];
  const forms = analysis.forms && analysis.forms.length > 0 ? analysis.forms : [];
  const workflows = analysis.workflows && analysis.workflows.length > 0 ? analysis.workflows : [];

  const featuresHtml = features.length > 0 ? `
<section id="features" class="py-16 px-4" style="background:${designSystem.colors.background}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold mb-8 text-center" style="color:${designSystem.colors.text}">Features</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      ${features.map((f: string, i: number) => `
      <div class="rounded-xl p-6 border" style="background:${designSystem.colors.surface};border-color:${designSystem.colors.primary}20">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 font-bold" style="background:${designSystem.colors.primary}15;color:${designSystem.colors.primary}">${String(i + 1).padStart(2, '0')}</div>
        <p style="color:${designSystem.colors.text}">${f}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  const entitiesHtml = entities.length > 0 ? `
<section id="entities" class="py-16 px-4" style="background:${designSystem.colors.surface}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold mb-8 text-center" style="color:${designSystem.colors.text}">Data Model</h2>
    <div class="grid gap-6 md:grid-cols-2">
      ${entities.map((e: any) => `
      <div class="rounded-xl p-6 border" style="background:${designSystem.colors.background};border-color:${designSystem.colors.primary}15">
        <h3 class="text-xl font-bold mb-3" style="color:${designSystem.colors.primary}">${e.name}</h3>
        <table class="w-full text-sm">
          <thead><tr class="border-b" style="border-color:${designSystem.colors.text}20"><th class="pb-2 text-left font-medium" style="color:${designSystem.colors.text}88">Property</th><th class="pb-2 text-left font-medium" style="color:${designSystem.colors.text}88">Type</th></tr></thead>
          <tbody>${e.properties.map((p: any) => `<tr class="border-b" style="border-color:${designSystem.colors.text}10"><td class="py-2">${p.name}</td><td class="py-2" style="color:${designSystem.colors.text}88">${p.type}</td></tr>`).join('')}</tbody>
        </table>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  const formsHtml = forms.length > 0 ? `
<section id="forms" class="py-16 px-4" style="background:${designSystem.colors.background}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold mb-8 text-center" style="color:${designSystem.colors.text}">Forms</h2>
    <div class="grid gap-6 md:grid-cols-2">
      ${forms.map((f: any) => `
      <div class="rounded-xl p-6 border" style="background:${designSystem.colors.surface};border-color:${designSystem.colors.primary}20">
        <h3 class="text-lg font-bold mb-4" style="color:${designSystem.colors.text}">${f.name}</h3>
        ${f.fields && f.fields.length > 0 ? f.fields.map((field: any) => `
        <div class="mb-3">
          <label class="block text-sm mb-1" style="color:${designSystem.colors.text}88">${field.label || field.name}</label>
          <input type="${field.type || 'text'}" placeholder="${field.placeholder || ''}" class="w-full rounded-lg py-2 px-3 text-sm border" style="background:${designSystem.colors.background};border-color:${designSystem.colors.text}20;color:${designSystem.colors.text}" />
        </div>`).join('') : '<p style="color:${designSystem.colors.text}66">No fields defined</p>'}
        <button class="w-full py-2 rounded-lg font-medium mt-4" style="background:${designSystem.colors.primary};color:white">Submit</button>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  const workflowsHtml = workflows.length > 0 ? `
<section id="workflows" class="py-16 px-4" style="background:${designSystem.colors.surface}">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold mb-8 text-center" style="color:${designSystem.colors.text}">Workflows</h2>
    <div class="space-y-8">
      ${workflows.map((w: any) => `
      <div class="rounded-xl p-6 border" style="background:${designSystem.colors.background};border-color:${designSystem.colors.primary}15">
        <h3 class="text-xl font-bold mb-4" style="color:${designSystem.colors.primary}">${w.name}</h3>
        <div class="flex items-center gap-3 flex-wrap">
          ${w.steps && w.steps.length > 0 ? w.steps.map((s: any, i: number) => `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style="background:${designSystem.colors.primary}20;color:${designSystem.colors.primary}">${i + 1}</div>
            <span style="color:${designSystem.colors.text}">${typeof s === 'string' ? s : s.name || s.action || s.description || 'Step'}</span>
            ${i < w.steps.length - 1 ? '<div class="w-8 h-px" style="background:${designSystem.colors.text}20"></div>' : ''}
          </div>`).join('\n          ') : '<p style="color:${designSystem.colors.text}66">No steps defined</p>'}
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>` : '';

  const navLinks = [
    { label: 'Home', href: '#home' },
    ...(features.length > 0 ? [{ label: 'Features', href: '#features' }] : []),
    ...(entities.length > 0 ? [{ label: 'Data', href: '#entities' }] : []),
    ...(forms.length > 0 ? [{ label: 'Forms', href: '#forms' }] : []),
    ...(workflows.length > 0 ? [{ label: 'Workflows', href: '#workflows' }] : []),
  ];

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${analysis.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap');
    body { font-family: '${designSystem.typography.body}', sans-serif; }
    h1, h2, h3, h4, h5, h6 { font-family: '${designSystem.typography.heading}', sans-serif; }
    html { scroll-behavior: smooth; }
  </style>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${designSystem.colors.primary}',
            secondary: '${designSystem.colors.secondary}',
            accent: '${designSystem.colors.accent}',
          },
          fontFamily: {
            heading: ['${designSystem.typography.heading}', 'sans-serif'],
            body: ['${designSystem.typography.body}', 'sans-serif'],
          },
          borderRadius: { DEFAULT: '${designSystem.borderRadius}' },
        }
      }
    }
  </script>
</head>
<body style="background:${designSystem.colors.background};color:${designSystem.colors.text}">
  <nav class="p-4 border-b sticky top-0 z-50" style="background:${designSystem.colors.surface}ee;border-color:${designSystem.colors.text}10;backdrop-filter:blur(12px)">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <h1 class="text-xl font-bold" style="color:${designSystem.colors.primary}">${analysis.title}</h1>
      <div class="flex gap-6 text-sm">
        ${navLinks.map(l => `<a href="${l.href}" class="hover:opacity-80 transition-opacity">${l.label}</a>`).join('\n          ')}
      </div>
    </div>
  </nav>
  <header id="home" class="py-24 px-4 text-center" style="background:linear-gradient(135deg, ${designSystem.colors.primary}15, ${designSystem.colors.secondary}15)">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl font-bold mb-4" style="color:${designSystem.colors.primary}">${analysis.title}</h1>
      <p class="text-xl" style="color:${designSystem.colors.text}bb">${analysis.description || 'Generated from document analysis'}</p>
      ${features.length > 0 ? `<a href="#features" class="inline-block mt-8 px-8 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90" style="background:${designSystem.colors.primary};color:white">Explore Features</a>` : ''}
    </div>
  </header>
  ${featuresHtml}
  ${entitiesHtml}
  ${formsHtml}
  ${workflowsHtml}
  <footer class="py-12 px-4 border-t text-center text-sm" style="background:${designSystem.colors.surface};border-color:${designSystem.colors.text}10;color:${designSystem.colors.text}66">
    <p>&copy; 2026 ${analysis.title}. Generated by DocuWeb AI.</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'preview.html'), html);
}
