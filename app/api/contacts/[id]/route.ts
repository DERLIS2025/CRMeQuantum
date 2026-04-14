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

  if (!body) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const existingContact = await prisma.contact.findUnique({ where: { id } });

  if (!existingContact) {
    return NextResponse.json({ error: 'Contacto no encontrado.' }, { status: 404 });
  }

  const updatedContact = await prisma.contact.update({
    where: { id },
    data: {
      fullName: body.fullName ?? existingContact.fullName,
      firstName: body.firstName ?? existingContact.firstName,
      lastName: body.lastName ?? existingContact.lastName,
      companyName: body.companyName ?? existingContact.companyName,
      email: body.email ?? existingContact.email,
      phone: body.phone ?? existingContact.phone,
      city: body.city ?? existingContact.city,
      country: body.country ?? existingContact.country,
      leadSource: body.leadSource ?? existingContact.leadSource,
      serviceInterest: body.serviceInterest ?? existingContact.serviceInterest,
      status: (body.status as ContactStatus) ?? existingContact.status,
      priority: body.priority ?? existingContact.priority,
    },
  });

  return NextResponse.json(updatedContact);
}
