import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email y password son obligatorios.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase().trim() },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(body.password, user.passwordHash);

  if (!validPassword) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  await createSessionCookie({
    id: user.id,
    email: user.email,
    role: user.role.name,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, role: user.role.name } });
}
