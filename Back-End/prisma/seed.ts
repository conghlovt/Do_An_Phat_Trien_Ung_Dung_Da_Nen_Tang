import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = [
    {
      email: 'admin@gmail.com',
      password: hashedPassword,
      username: 'Admin',
      role: 'admin',
      code: 'AD01',
      avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
      email: 'partner@gmail.com',
      password: hashedPassword,
      username: 'Partner',
      role: 'partner',
      code: 'PT01',
      avatar: 'https://i.pravatar.cc/150?u=2',
    },
    {
      email: 'customer@gmail.com',
      password: hashedPassword,
      username: 'Customer',
      role: 'customer',
      code: 'CUS01',
      avatar: 'https://i.pravatar.cc/150?u=3',
    },
  ];

  console.log('Seeding users...');
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
