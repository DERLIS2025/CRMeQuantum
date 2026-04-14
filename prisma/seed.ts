import { PrismaClient, UserRoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultStages = [
  { name: 'Nuevo lead', position: 1, probabilityPercent: 10 },
  { name: 'Contactado', position: 2, probabilityPercent: 20 },
  { name: 'Calificado', position: 3, probabilityPercent: 35 },
  { name: 'Reunión agendada', position: 4, probabilityPercent: 50 },
  { name: 'Propuesta enviada', position: 5, probabilityPercent: 65 },
  { name: 'Negociación', position: 6, probabilityPercent: 80 },
  { name: 'Ganado', position: 7, probabilityPercent: 100 },
  { name: 'Perdido', position: 8, probabilityPercent: 0 },
];

async function main() {
  // ===== PLAN =====
  const basePlan = await prisma.plan.upsert({
    where: { code: 'base' },
    update: { isActive: true },
    create: {
      code: 'base',
      name: 'Plan Base',
      monthlyPrice: 99,
      isActive: true,
    },
  });

  // ===== ORGANIZATION =====
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-equantum' },
    update: {
      isActive: true,
      name: 'eQuantum Demo',
    },
    create: {
      slug: 'demo-equantum',
      name: 'eQuantum Demo',
      isActive: true,
    },
  });

  // ===== SUBSCRIPTION =====
  await prisma.subscription.upsert({
    where: { organizationId: organization.id },
    update: {
      planId: basePlan.id,
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      planId: basePlan.id,
      isActive: true,
    },
  });

  // ===== ROLES =====
  const roleNames: UserRoleName[] = ['ADMIN', 'SUPERVISOR', 'ADVISOR'];

  for (const roleName of roleNames) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Rol ${roleName} para eQuantum CRM`,
      },
    });
  }

  // ===== CHANNELS =====
  const channels = [
    { type: 'WHATSAPP', name: 'WhatsApp Demo' },
    { type: 'INSTAGRAM', name: 'Instagram Demo' },
    { type: 'MESSENGER', name: 'Messenger Demo' },
  ] as const;

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: {
        organizationId_name: {
          organizationId: organization.id,
          name: channel.name,
        },
      },
      update: { isActive: true },
      create: {
        organizationId: organization.id,
        type: channel.type,
        name: channel.name,
        isActive: true,
      },
    });
  }

  // ===== PIPELINE =====
  const pipeline = await prisma.pipeline.upsert({
    where: {
      organizationId_name: {
        organizationId: organization.id,
        name: 'Pipeline Comercial eQuantum',
      },
    },
    update: { isDefault: true },
    create: {
      organizationId: organization.id,
      name: 'Pipeline Comercial eQuantum',
      isDefault: true,
    },
  });

  for (const stage of defaultStages) {
    await prisma.pipelineStage.upsert({
      where: {
        pipelineId_position: {
          pipelineId: pipeline.id,
          position: stage.position,
        },
      },
      update: {
        name: stage.name,
        probabilityPercent: stage.probabilityPercent,
      },
      create: {
        pipelineId: pipeline.id,
        name: stage.name,
        position: stage.position,
        probabilityPercent: stage.probabilityPercent,
      },
    });
  }

  // ===== ADMIN USER =====
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'ADMIN' },
  });

  const passwordHash = await bcrypt.hash('Admin1234!', 10);

  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@equantum.local',
      },
    },
    update: {
      fullName: 'Admin eQuantum',
      roleId: adminRole.id,
      passwordHash,
      isActive: true,
    },
    create: {
      organizationId: organization.id,
      email: 'admin@equantum.local',
      fullName: 'Admin eQuantum',
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(
    '✅ Seed SaaS completado | Org: demo-equantum | Usuario: admin@equantum.local / Admin1234!'
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });