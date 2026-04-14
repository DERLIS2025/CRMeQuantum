import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email y password son obligatorios.' }, { status: 400 });
  }

  const normalizedEmail = body.email.toLowerCase().trim();
  const matchedUser = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    include: { role: true, organization: true },
  });

  if (!matchedUser || !matchedUser.isActive || !matchedUser.organization.isActive) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(body.password, matchedUser.passwordHash);

  if (!validPassword) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  await createSessionCookie({
    id: matchedUser.id,
    organizationId: matchedUser.organizationId,
    email: matchedUser.email,
    role: matchedUser.role.name,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      role: matchedUser.role.name,
      organizationId: matchedUser.organizationId,
      organizationName: matchedUser.organization.name,
    },
  });
}
