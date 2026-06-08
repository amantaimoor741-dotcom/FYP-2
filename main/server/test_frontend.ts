import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const vitePath = path.join(root, 'node_modules', '.bin', 'vite.cmd');

const vite = spawn(vitePath, ['--port=3000', '--host=0.0.0.0'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

let output = '';
let ready = false;

await new Promise<void>((resolve, reject) => {
  const timeout = setTimeout(() => {
    if (!ready) reject(new Error('Vite did not start within 20s'));
  }, 20000);

  vite.stdout?.on('data', (data: Buffer) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);
    if (text.includes('Local:') || text.includes('ready') || text.includes('localhost:3000')) {
      ready = true;
      clearTimeout(timeout);
      setTimeout(resolve, 1000); // give it a moment to stabilize
    }
  });

  vite.stderr?.on('data', (data: Buffer) => {
    const text = data.toString();
    output += text;
    process.stderr.write(text);
  });

  vite.on('error', (err) => {
    clearTimeout(timeout);
    reject(err);
  });

  vite.on('exit', (code) => {
    clearTimeout(timeout);
    if (!ready) reject(new Error(`Vite exited with code ${code} before ready.\n${output}`));
  });
});

// Now test the frontend
console.log('\n--- Testing frontend ---');
try {
  const res = await fetch('http://localhost:3000');
  const text = await res.text();
  if (res.status === 200 && text.includes('root')) {
    console.log('  ✓ GET / returns 200 and contains React root div');
  } else {
    console.log(`  ✗ Unexpected response: status=${res.status}, containsRoot=${text.includes('root')}`);
  }
} catch (e: any) {
  console.log(`  ✗ Failed to fetch frontend: ${e.message}`);
}

// Test a frontend page
try {
  const res = await fetch('http://localhost:3000/');
  const text = await res.text();
  console.log(`  ✓ Frontend HTML served (${text.length} bytes)`);
} catch (e: any) {
  console.log(`  ✗ ${e.message}`);
}

vite.kill();
process.exit(0);
