import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const channels = await prisma.channel.findMany({
    where: { isActive: true, organizationId: session.organizationId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(channels);
}
