import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

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
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const server = app.listen(4000, '0.0.0.0', async () => {
  console.log('🚀 Server on :4000');

  try {
    const uid = Date.now();
    const email = `e2e${uid}@test.com`;

    // 1. Health
    console.log('✓ Health:', (await fetch('http://localhost:4000/api/health').then(r => r.json())).status);

    // 2. Register
    const reg = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: 'E2E User', password: 'test123' }),
    }).then(r => r.text());
    const regData = JSON.parse(reg);
    if (!regData.token) { console.log('Register failed:', reg); process.exit(1); }
    const token = regData.token;
    console.log('✓ Registered:', email);

    // 3. Create test document
    const docText = `# E-Commerce Fashion App
A mobile e-commerce app for fashion retail.

## Features
- User registration/login with email
- Product catalog with search and categories
- Shopping cart with add/remove
- Checkout with address and payment
- Order tracking
- Admin dashboard for managing products

## Entities
User: id, name, email, password, role, address, createdAt
Product: id, name, description, price, categoryId, image, stock, createdAt
Category: id, name, description
Order: id, userId, items, total, status, shippingAddress, createdAt
OrderItem: id, orderId, productId, quantity, price
Cart: id, userId
CartItem: id, cartId, productId, quantity

## API Endpoints
POST /api/auth/register, POST /api/auth/login
GET /api/products, GET /api/products/:id
GET /api/categories
GET /api/cart, POST /api/cart/items, DELETE /api/cart/items/:id
POST /api/orders, GET /api/orders, GET /api/orders/:id
PUT /api/users/profile

## Roles
- Customer: browse, purchase, track
- Admin: manage products, view orders, manage users`;

    fs.writeFileSync('data/uploads/doc-e2e.txt', docText);

    // 4. Upload
    const form = new FormData();
    form.append('document', new Blob([docText], { type: 'text/plain' }), 'doc-e2e.txt');
    const uploadRes = await fetch('http://localhost:4000/api/documents/upload', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + token },
      body: form,
    }).then(r => r.text());
    const uploadData = JSON.parse(uploadRes);
    if (!uploadData.document?.id) { console.log('Upload failed:', uploadRes); process.exit(1); }
    console.log('✓ Uploaded:', uploadData.document.id);

    // 5. Generate
    const genRes = await fetch('http://localhost:4000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ documentId: uploadData.document.id, projectName: 'E-Commerce App' }),
    }).then(r => r.text());
    const genData = JSON.parse(genRes);
    if (!genData.projectId) { console.log('Generate failed:', genRes); process.exit(1); }
    console.log('✓ Generating:', genData.projectId);

    // 6. Poll
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await fetch(`http://localhost:4000/api/generate/${genData.projectId}/status`, {
        headers: { 'Authorization': 'Bearer ' + token },
      }).then(r => r.json());
      process.stdout.write(`  [${i+1}] ${status.status}${status.error ? ': ' + status.error.substring(0, 100) : ''}\n`);
      if (status.status === 'completed') {
        const result = await fetch(`http://localhost:4000/api/generate/${genData.projectId}/result`, {
          headers: { 'Authorization': 'Bearer ' + token },
        }).then(r => r.json());
        console.log('\n✅ GENERATION SUCCESS!');
        if (result.documentAnalysis) {
          const a = result.documentAnalysis;
          console.log(`  Title: ${a.title}`);
          console.log(`  Domain: ${a.domain}`);
          console.log(`  Entities: ${a.entities?.length || 0}`);
          console.log(`  Features: ${(a.features || []).join(', ')}`);
          console.log(`  APIs: ${(a.apis || []).map((x: any) => x.method + ' ' + x.path).join(', ')}`);
        }
        if (result.outputPath) {
          console.log(`  ZIP: ${result.outputPath}`);
          const size = fs.statSync(result.outputPath).size;
          console.log(`  Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
        }
        break;
      }
      if (status.status === 'failed') {
        const log = fs.existsSync('data/server.log') ? fs.readFileSync('data/server.log', 'utf-8').slice(-2000) : 'No log';
        console.log('\n❌ Failed:', status.error);
        console.log('Log:', log);
        break;
      }
    }
  } catch (err: any) {
    console.error('ERROR:', err.message, err.stack?.substring(0, 500));
  }

  server.close();
  process.exit(0);
});
