const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminPassword) {
    console.warn('⚠ ADMIN_PASSWORD not set, skipping seed');
    return;
  }
  if (!adminEmail) {
    console.warn('⚠ ADMIN_EMAIL not set, skipping seed');
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
      },
    });
    
    console.log('✅ Seed complete - User ready:', user.email);
  } catch (error) {
    if (error.code === 'P2021') {
      throw new Error('Database tables not found. Migrations may not have run. Error: ' + error.message);
    }
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

