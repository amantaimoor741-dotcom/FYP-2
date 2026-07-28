import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.resolve(root, '..', 'main', 'server');
const dest = path.resolve(root, 'src', 'server');
const prismaSource = path.resolve(root, '..', 'main', 'prisma');
const prismaDest = path.resolve(root, 'prisma');

// Copy server code
if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
fs.cpSync(source, dest, { recursive: true, filter: (src) => !src.includes('node_modules') && !src.endsWith('.db') });
console.log('Copied server code to functions/src/server/');

// Copy Prisma schema
if (!fs.existsSync(prismaDest)) fs.mkdirSync(prismaDest, { recursive: true });
fs.cpSync(path.join(prismaSource, 'schema.prisma'), path.join(prismaDest, 'schema.prisma'));
console.log('Copied Prisma schema to functions/prisma/');

// Copy .env
fs.cpSync(path.resolve(root, '..', '.env'), path.resolve(root, '.env'));
console.log('Copied .env to functions/');
