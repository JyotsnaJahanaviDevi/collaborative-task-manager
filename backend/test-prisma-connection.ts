import prisma from './src/config/database';

async function testConnection() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Connection successful, users:', users);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
