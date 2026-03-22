const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Jean',
    },
  });
  
  console.log('✅ Seed complete - User created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
