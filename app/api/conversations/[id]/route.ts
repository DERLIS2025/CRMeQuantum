import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/api-auth';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await context.params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
    },
    include: {
      contact: true,
      channel: true,
      assignedUser: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}