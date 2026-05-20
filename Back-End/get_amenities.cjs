const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ams = await prisma.amenity.findMany();
  console.log(JSON.stringify(ams, null, 2));
}
main().finally(() => prisma.$disconnect());
