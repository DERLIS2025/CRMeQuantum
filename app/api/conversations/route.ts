import { NextResponse } from 'next/server';
import { ConversationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      contact: true,
      channel: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.contactId || !body?.channelId) {
    return NextResponse.json({ error: 'contactId y channelId son obligatorios.' }, { status: 400 });
  }

  const [contact, channel] = await Promise.all([
    prisma.contact.findUnique({ where: { id: body.contactId } }),
    prisma.channel.findUnique({ where: { id: body.channelId } }),
  ]);

  if (!contact) {
    return NextResponse.json({ error: 'Contacto no encontrado.' }, { status: 404 });
  }

  if (!channel) {
    return NextResponse.json({ error: 'Canal no encontrado.' }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      contactId: contact.id,
      channelId: channel.id,
      assignedUserId: body.assignedUserId ?? session.userId,
      subject: body.subject ?? `Conversación con ${contact.fullName}`,
      status: (body.status as ConversationStatus) ?? ConversationStatus.OPEN,
      priority: body.priority ?? 'normal',
      lastMessagePreview: body.initialMessage ?? null,
      lastMessageAt: body.initialMessage ? new Date() : null,
    },
  });

  if (body.initialMessage) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: 'USER',
        senderUserId: session.userId,
        direction: 'OUTBOUND',
        messageType: 'TEXT',
        textBody: String(body.initialMessage),
        deliveryStatus: 'SENT',
      },
    });
  }

  const fullConversation = await prisma.conversation.findUnique({
    where: { id: conversation.id },
    include: {
      contact: true,
      channel: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(fullConversation, { status: 201 });
}
