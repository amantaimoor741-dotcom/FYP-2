import { PrismaClient } from './server/generated/prisma/index.js';
const prisma = new PrismaClient();
const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
console.log('Recent projects:');
for (const p of projects) {
  console.log(`  [${p.status}] ${p.name} | error: ${p.error || 'none'} | createdAt: ${p.createdAt}`);
}
await prisma.$disconnect();
