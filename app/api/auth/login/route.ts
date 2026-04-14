import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: 'Email y password son obligatorios.' },
      { status: 400 }
    );
  }

  const normalizedEmail = body.email.toLowerCase().trim();

  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    include: {
      role: true,
      organization: true,
    },
  });

  if (!user || !user.isActive || !user.organization?.isActive) {
    return NextResponse.json(
      { error: 'Credenciales inválidas.' },
      { status: 401 }
    );
  }

  const validPassword = await bcrypt.compare(
    body.password,
    user.passwordHash
  );

  if (!validPassword) {
    return NextResponse.json(
      { error: 'Credenciales inválidas.' },
      { status: 401 }
    );
  }

  await createSessionCookie({
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    role: user.role.name,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role.name,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
    },
  });
}