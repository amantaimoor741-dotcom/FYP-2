import prisma from './client.ts';

export async function upsertUser(clerkId: string, email: string, name?: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email, name },
    create: { clerkId, email, name, plan: 'free', quota: 3 },
  });
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function getUsageStats() {
  const [users, projects] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
  ]);
  return { totalUsers: users, totalProjects: projects };
}
