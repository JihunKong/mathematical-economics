const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTeacher() {
  try {
    console.log('Creating teacher account...');
    
    // Check if teacher already exists
    const existingTeacher = await prisma.user.findUnique({
      where: { email: 'teacher@test.com' }
    });

    if (existingTeacher) {
      console.log('Teacher already exists, updating to ensure proper setup...');
      await prisma.user.update({
        where: { email: 'teacher@test.com' },
        data: {
          role: 'TEACHER',
          isActive: true
        }
      });
    } else {
      // Create teacher account
      const hashedPassword = await bcrypt.hash('teacher123!', 10);
      await prisma.user.create({
        data: {
          email: 'teacher@test.com',
          password: hashedPassword,
          name: '테스트 교사',
          role: 'TEACHER',
          isActive: true
        }
      });
      console.log('Teacher account created successfully!');
    }

    // Also ensure admin can act as teacher
    const admin = await prisma.user.findUnique({
      where: { email: 'purusil55@gmail.com' }
    });

    if (admin && admin.role === 'ADMIN') {
      console.log('Admin exists, keeping as ADMIN (can create classes too)');
    }

    console.log('\nAvailable teacher accounts:');
    console.log('1. Email: teacher@test.com, Password: teacher123!');
    console.log('2. Admin can also create classes: purusil55@gmail.com, Password: alsk2004A!@#');
    
  } catch (error) {
    console.error('Error creating teacher:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTeacher();