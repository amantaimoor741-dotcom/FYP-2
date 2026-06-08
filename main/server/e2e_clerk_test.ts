import fs from 'fs';
import path from 'path';

const TOKEN = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zRHdHWlhNZTZDSldBR0Y0S0dRSGp0M2R4NFkiLCJvaWF0IjoxNzgwMzk4MjMzLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3ODA0MDE4MzMsImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzgwMzk4MjMzLCJpc3MiOiJodHRwczovL2dyYW5kLWxpb24tODcuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzgwMzk4MjIzLCJzaWQiOiJzZXNzXzNFWnU1UWZCUE1YN1hBUVhQZFZTSko1OGUzMCIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfM0VaclVUMTJDWHROSjVyV3dlcE90cTM4dWhHIiwidiI6Mn0.ddd5u2RV20eFMnHvvfSyQt9tCSN5MdCZpXMEN5bbknKr9sFNMUwtXg9vJ2N9I5JGQou3NOKBxoyq67gpL6nGqJWH4XP8ZWuG_v_cGe20RvUC1X4GZcMMn8PeH1uUzVOyNsq69lCVqRvnVmdZZoBM_uXacHkpklwp3QpLKueWEE5eNhLx_dpGcnqBbb_ntBe_CPr3xuXVijyw0y_PFFwyY363ipaQFwEqwQZzgG5DiGLj3V0oVJMyUQnkcfOA8JnC1gyY97NfYPwJ2ax2G7Jf29-TGOc-Q8NtwCScUr0HxNibpM9UC88VB4oPu7Hw1_uazexbgXQqSGZwcX3EMuYLqQ';

const API = 'http://localhost:4000/api';

async function main() {
  // 1. Upload document
  console.log('\n=== STEP 1: Upload document ===');
  const form = new FormData();
  const docText = fs.readFileSync('data/uploads/doc-e2e.txt', 'utf-8');
  form.append('document', new Blob([docText], { type: 'text/plain' }), 'doc-e2e.txt');
  const uploadRes = await fetch(`${API}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: form,
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.document?.id) {
    console.log('❌ Upload failed:', JSON.stringify(uploadData));
    process.exit(1);
  }
  console.log(`✅ Uploaded doc: ${uploadData.document.id}`);

  // 2. Start generation
  console.log('\n=== STEP 2: Start generation ===');
  const genRes = await fetch(`${API}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({
      documentId: uploadData.document.id,
      projectName: 'E-Commerce App',
      theme: 'modern',
      config: { headings: true, nav: true, images: false, seo: true }
    }),
  });
  const genData = await genRes.json();
  if (!genData.projectId) {
    console.log('❌ Generate failed:', JSON.stringify(genData));
    process.exit(1);
  }
  console.log(`✅ Project: ${genData.projectId} (status: ${genData.status})`);

  // 3. Poll for completion
  console.log('\n=== STEP 3: Poll for completion ===');
  let completed = false;
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`${API}/generate/${genData.projectId}/status`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    const statusData = await statusRes.json();
    const elapsed = ((i + 1) * 5);
    process.stdout.write(`  [${elapsed}s] ${statusData.status}${statusData.error ? ': ' + statusData.error.substring(0, 150) : ''}\n`);
    if (statusData.status === 'completed') {
      completed = true;
      break;
    }
    if (statusData.status === 'failed') {
      console.log('\n❌ Pipeline failed:', statusData.error);
      const logPath = 'data/server.log';
      if (fs.existsSync(logPath)) {
        console.log('Last 2KB of server.log:');
        console.log(fs.readFileSync(logPath, 'utf-8').slice(-2000));
      }
      process.exit(1);
    }
  }

  if (!completed) {
    console.log('\n❌ Timed out after 10 minutes');
    process.exit(1);
  }

  // 4. Get result
  console.log('\n=== STEP 4: Get result ===');
  const resultRes = await fetch(`${API}/generate/${genData.projectId}/result`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  const result = await resultRes.json();
  console.log(`✅ Title: ${result.documentAnalysis?.title || 'N/A'}`);
  console.log(`✅ Domain: ${result.documentAnalysis?.domain || 'N/A'}`);
  console.log(`✅ Entities: ${result.documentAnalysis?.entities?.length || 0}`);
  console.log(`✅ ZIP: ${result.outputPath || 'N/A'}`);

  if (result.outputPath && fs.existsSync(result.outputPath)) {
    const size = fs.statSync(result.outputPath).size;
    console.log(`✅ ZIP Size: ${(size / 1024).toFixed(1)} KB`);
  }

  console.log('\n🎉 FULL PIPELINE SUCCESS!');
}

main().catch(err => {
  console.error('FATAL:', err.message, err.stack?.substring(0, 500));
  process.exit(1);
});
