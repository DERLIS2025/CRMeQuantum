import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const INITIAL_PIPELINE_NAME = 'Pipeline Comercial eQuantum';
const INITIAL_STAGES = [
  { name: 'Nuevo lead', position: 1, probabilityPercent: 10 },
  { name: 'Contactado', position: 2, probabilityPercent: 20 },
  { name: 'Calificado', position: 3, probabilityPercent: 35 },
  { name: 'Reunión agendada', position: 4, probabilityPercent: 50 },
  { name: 'Propuesta enviada', position: 5, probabilityPercent: 65 },
  { name: 'Negociación', position: 6, probabilityPercent: 80 },
  { name: 'Ganado', position: 7, probabilityPercent: 100 },
  { name: 'Perdido', position: 8, probabilityPercent: 0 },
];

function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const companyName = String(body.companyName ?? '').trim();
  const companySlug = String(body.companySlug ?? '')
    .trim()
    .toLowerCase();
  const fullName = String(body.fullName ?? '').trim();
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const password = String(body.password ?? '');

  if (!companyName || !companySlug || !fullName || !email || !password) {
    return NextResponse.json(
      { error: 'Todos los campos son obligatorios.' },
      { status: 400 }
    );
  }

  if (!isValidSlug(companySlug)) {
    return NextResponse.json(
      { error: 'Slug inválido. Usá minúsculas, números y guiones (sin espacios).' },
      { status: 400 }
    );
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json(
      {
        error:
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
      },
      { status: 400 }
    );
  }

  const [basePlan, adminRole, existingOrganization, existingUser] = await Promise.all([
    prisma.plan.findUnique({ where: { code: 'base' } }),
    prisma.role.findUnique({ where: { name: 'ADMIN' } }),
    prisma.organization.findUnique({ where: { slug: companySlug } }),
    prisma.user.findFirst({ where: { email } }),
  ]);

  if (!basePlan) {
    return NextResponse.json(
      { error: 'No existe plan base configurado (code=base).' },
      { status: 500 }
    );
  }

  if (!adminRole) {
    return NextResponse.json(
      { error: 'No existe rol ADMIN configurado.' },
      { status: 500 }
    );
  }

  if (existingOrganization) {
    return NextResponse.json({ error: 'Ese slug ya está en uso.' }, { status: 409 });
  }

  if (existingUser) {
    return NextResponse.json(
      { error: 'Ya existe un usuario con ese email.' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug: companySlug,
          isActive: true,
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: basePlan.id,
          isActive: true,
        },
      });

      await tx.user.create({
        data: {
          organizationId: organization.id,
          roleId: adminRole.id,
          fullName,
          email,
          passwordHash,
          isActive: true,
        },
      });

      const pipeline = await tx.pipeline.create({
        data: {
          organizationId: organization.id,
          name: INITIAL_PIPELINE_NAME,
          isDefault: true,
        },
      });

      await tx.pipelineStage.createMany({
        data: INITIAL_STAGES.map((stage) => ({
          pipelineId: pipeline.id,
          name: stage.name,
          position: stage.position,
          probabilityPercent: stage.probabilityPercent,
        })),
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'No se pudo crear la cuenta: slug o email duplicado.' },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: 'Error inesperado al crear la cuenta.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, message: 'Cuenta creada correctamente. Ya podés iniciar sesión.' },
    { status: 201 }
  );
}
