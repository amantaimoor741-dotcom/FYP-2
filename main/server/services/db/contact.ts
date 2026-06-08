import prisma from './client.ts';

export async function createContactMessage(data: {
  userId?: string;
  name: string;
  email: string;
  message: string;
}) {
  return prisma.contactMessage.create({ data });
}
