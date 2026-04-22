import 'dotenv/config';
import prisma from './src/lib/prisma.js';


async function testConnection() {
  try {
    console.log('Testing connection to database...');
    // Try to count users
    const userCount = await prisma.user.count();
    console.log('Connection successful!');
    console.log(`Total users in database: ${userCount}`);
  } catch (error) {
    console.error('Connection failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
