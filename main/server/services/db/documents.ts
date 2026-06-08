import prisma from './client.ts';

export async function createDocument(data: {
  userId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  projectId?: string;
}) {
  return prisma.document.create({ data });
}

export async function getDocument(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
