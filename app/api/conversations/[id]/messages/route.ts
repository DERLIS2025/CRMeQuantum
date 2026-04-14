import { NextResponse } from 'next/server';
import { MessageDirection, MessageType, SenderType } from '@prisma/client';
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

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      senderUser: { select: { id: true, fullName: true, email: true } },
    },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request, context: Context) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await context.params;

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.textBody) {
    return NextResponse.json({ error: 'textBody es obligatorio.' }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderType: (body.senderType as SenderType) ?? SenderType.USER,
      senderUserId: session.userId,
      messageType: (body.messageType as MessageType) ?? MessageType.TEXT,
      direction: (body.direction as MessageDirection) ?? MessageDirection.OUTBOUND,
      textBody: String(body.textBody),
      deliveryStatus: 'SENT',
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: {
      lastMessageAt: message.createdAt,
      lastMessagePreview: message.textBody,
      unreadCount: 0,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
