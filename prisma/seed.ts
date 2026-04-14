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
