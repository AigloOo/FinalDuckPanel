const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'duckypass123', 12);
  
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'jean@duckpanel.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'jean@duckpanel.com',
      password: hashedPassword,
      name: 'Jean',
    },
  });
  
  console.log('✅ Seed complete - User created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
