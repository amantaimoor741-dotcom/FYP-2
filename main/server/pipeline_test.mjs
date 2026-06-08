import fs from 'fs';

const CLERK_SECRET = 'sk_test_vJxPVAVxQfi6Aa7PqctTJrznU9ATkM37yQrLNnyLTt';
const API = 'http://localhost:4000/api';

async function getToken() {
  const s = await (await fetch('https://api.clerk.com/v1/sessions', { method:'POST', headers:{Authorization:'Bearer '+CLERK_SECRET,'Content-Type':'application/json'}, body:JSON.stringify({user_id:'user_3EZrUT12CXtNJ5rWwepOtq38uhG'})})).json();
  const t = await (await fetch('https://api.clerk.com/v1/sessions/'+s.id+'/tokens', { method:'POST', headers:{Authorization:'Bearer '+CLERK_SECRET,'Content-Type':'application/json'}, body:JSON.stringify({expires_in_seconds:3600})})).json();
  return t.jwt;
}

async function main() {
  const TOKEN = await getToken();

  // 1. Upload
  console.log('=== Upload ===');
  const form = new FormData();
  form.append('document', new Blob([fs.readFileSync('data/uploads/doc-e2e.txt','utf-8')], {type:'text/plain'}), 'doc-e2e.txt');
  const up = await (await fetch(API+'/documents/upload', {method:'POST', headers:{Authorization:'Bearer '+TOKEN}, body:form})).json();
  console.log('Doc:', up.document?.id);
  if (!up.document?.id) { console.log('FAIL:', JSON.stringify(up)); process.exit(1); }

  // 2. Generate
  console.log('=== Generate ===');
  const gen = await (await fetch(API+'/generate', {method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN}, body:JSON.stringify({documentId:up.document.id,projectName:'E-Commerce App',theme:'modern',config:{headings:true,nav:true,images:false,seo:true}})})).json();
  console.log('Project:', gen.projectId);
  if (!gen.projectId) { console.log('FAIL:', JSON.stringify(gen)); process.exit(1); }

  // 3. Poll
  console.log('=== Poll ===');
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const s = await (await fetch(API+'/generate/'+gen.projectId+'/status', {headers:{Authorization:'Bearer '+TOKEN}})).json();
    process.stdout.write('  ['+((i+1)*5)+'s] '+s.status+(s.error?': '+s.error.substring(0,200):'')+'\n');
    if (s.status === 'completed') {
      const r = await (await fetch(API+'/generate/'+gen.projectId+'/result', {headers:{Authorization:'Bearer '+TOKEN}})).json();
      console.log('\n✅ SUCCESS');
      console.log('  Title:', r.documentAnalysis?.title);
      console.log('  Domain:', r.documentAnalysis?.domain);
      console.log('  Entities:', r.documentAnalysis?.entities?.length);
      console.log('  ZIP:', r.outputPath);
      if (r.outputPath && fs.existsSync(r.outputPath)) console.log('  Size:', (fs.statSync(r.outputPath).size/1024).toFixed(1)+' KB');
      process.exit(0);
    }
    if (s.status === 'failed') { console.log('\n❌ FAILED:', s.error); process.exit(1); }
  }
  console.log('\n❌ TIMEOUT');
  process.exit(1);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
