import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const updated = await prisma.user.update({
      where: { email: 'dullacyp@gmail.com' },
      data: { role: 'ADMIN', failedAttempts: 0, lockedUntil: null },
    });
    console.log('Admin user updated:', updated);
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
