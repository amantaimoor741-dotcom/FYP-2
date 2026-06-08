import prisma from './client.ts';

export async function createProject(data: {
  name: string;
  userId: string;
  theme?: string;
  config?: Record<string, any>;
  documentType?: string;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      userId: data.userId,
      theme: data.theme || 'modern',
      config: typeof data.config === 'string' ? data.config : JSON.stringify(data.config || {}),
      documentType: data.documentType,
      status: 'analyzing',
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function updateProject(id: string, data: Record<string, any>) {
  const updateData: any = { ...data };
  if (data.config !== undefined) updateData.config = typeof data.config === 'string' ? data.config : JSON.stringify(data.config);
  return prisma.project.update({ where: { id }, data: updateData });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function getAllProjects() {
  return prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProjectStats() {
  const [total, completed, failed, processing] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'completed' } }),
    prisma.project.count({ where: { status: 'failed' } }),
    prisma.project.count({ where: { status: { notIn: ['completed', 'failed'] } } }),
  ]);
  return { totalProjects: total, completedProjects: completed, failedProjects: failed, processingProjects: processing };
}
