import prisma from './client.ts';

export async function getSettings(userId: string) {
  const s = await prisma.settings.findUnique({ where: { userId } });
  return s ? JSON.parse(s.data) : {};
}

export async function updateSettings(userId: string, data: Record<string, any>) {
  const existing = await prisma.settings.findUnique({ where: { userId } });
  const merged = { ...(existing ? JSON.parse(existing.data) : {}), ...data };
  return prisma.settings.upsert({
    where: { userId },
    update: { data: JSON.stringify(merged) },
    create: { userId, data: JSON.stringify(merged) },
  });
}
