import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { getSessionFromRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    where: {
      organizationId: session.organizationId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedUser: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.fullName) {
    return NextResponse.json({ error: 'fullName es obligatorio.' }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      fullName: body.fullName,
      organizationId: session.organizationId,
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      companyName: body.companyName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      city: body.city ?? null,
      country: body.country ?? null,
      leadSource: body.leadSource ?? null,
      serviceInterest: body.serviceInterest ?? null,
      status: (body.status as ContactStatus) ?? ContactStatus.NEW,
      priority: body.priority ?? null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}