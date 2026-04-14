import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { getSessionFromRequest } from '@/lib/api-auth';

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const existingContact = await prisma.contact.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
    },
  });

  if (!existingContact) {
    return NextResponse.json({ error: 'Contacto no encontrado.' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if ('fullName' in body) data.fullName = body.fullName;
  if ('firstName' in body) data.firstName = body.firstName;
  if ('lastName' in body) data.lastName = body.lastName;
  if ('companyName' in body) data.companyName = body.companyName;
  if ('email' in body) data.email = body.email;
  if ('phone' in body) data.phone = body.phone;
  if ('city' in body) data.city = body.city;
  if ('country' in body) data.country = body.country;
  if ('leadSource' in body) data.leadSource = body.leadSource;
  if ('serviceInterest' in body) data.serviceInterest = body.serviceInterest;
  if ('priority' in body) data.priority = body.priority;

  if ('status' in body) {
    data.status = body.status as ContactStatus;
  }

  const updatedContact = await prisma.contact.update({
    where: { id: existingContact.id },
    data,
  });

  return NextResponse.json(updatedContact);
}
