const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function debug() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teacher@example.com' },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        classId: true,
        isActive: true,
      }
    });
    
    console.log('User found:', !!user);
    console.log('Email:', user?.email);
    console.log('Has password:', !!user?.password);
    console.log('Password length:', user?.password?.length);
    
    if (user?.password) {
      const testPassword = 'password123';
      const result = await bcrypt.compare(testPassword, user.password);
      console.log('Password comparison result:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();