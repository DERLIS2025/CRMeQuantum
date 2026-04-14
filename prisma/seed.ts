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

  const channels = [
    { type: 'WHATSAPP', name: 'WhatsApp Demo' },
    { type: 'INSTAGRAM', name: 'Instagram Demo' },
    { type: 'MESSENGER', name: 'Messenger Demo' },
  ] as const;

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { name: channel.name },
      update: { isActive: true },
      create: {
        type: channel.type,
        name: channel.name,
        isActive: true,
      },
    });
  }

  const pipeline = await prisma.pipeline.upsert({
    where: { name: 'Pipeline Comercial eQuantum' },
    update: { isDefault: true },
    create: { name: 'Pipeline Comercial eQuantum', isDefault: true },
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

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'ADMIN' } });
  const passwordHash = await bcrypt.hash('Admin1234!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@equantum.local' },
    update: {
      fullName: 'Admin eQuantum',
      roleId: adminRole.id,
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'admin@equantum.local',
      fullName: 'Admin eQuantum',
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Seed completado. Usuario demo: admin@equantum.local / Admin1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
