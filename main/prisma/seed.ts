import { PrismaClient } from '../server/generated/prisma/index.js';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: 'demo@doc2web.com' },
    update: {},
    create: {
      email: 'demo@doc2web.com',
      name: 'Demo User',
      password: hashPassword('demo1234'),
      plan: 'pro',
      quota: 100,
    },
  });
  console.log('Seeded demo user:', demo.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
