import { NextResponse } from 'next/server';
import {
  ConversationStatus,
  DeliveryStatus,
  MessageDirection,
  MessageType,
  SenderType,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId: session.organizationId,
    },
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
    return NextResponse.json(
      { error: 'contactId y channelId son obligatorios.' },
      { status: 400 }
    );
  }

  const [contact, channel] = await Promise.all([
    prisma.contact.findFirst({
      where: {
        id: body.contactId,
        organizationId: session.organizationId,
      },
    }),
    prisma.channel.findFirst({
      where: {
        id: body.channelId,
        organizationId: session.organizationId,
      },
    }),
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
      organizationId: session.organizationId,
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
        organizationId: session.organizationId,
        senderType: SenderType.USER,
        senderUserId: session.userId,
        direction: MessageDirection.OUTBOUND,
        messageType: MessageType.TEXT,
        textBody: String(body.initialMessage),
        deliveryStatus: DeliveryStatus.SENT,
      },
    });
  }

  const fullConversation = await prisma.conversation.findFirst({
    where: {
      id: conversation.id,
      organizationId: session.organizationId,
    },
    include: {
      contact: true,
      channel: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(fullConversation, { status: 201 });
}