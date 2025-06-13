import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check existing users
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });
  
  console.log('Existing users:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
  });
  
  // Check if teacher exists
  const teacher = await prisma.user.findUnique({
    where: { email: 'teacher@example.com' }
  });
  
  if (!teacher) {
    console.log('\nTeacher not found. Creating teacher account...');
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    const newTeacher = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        password: hashedPassword,
        name: 'Teacher',
        role: 'TEACHER',
        isActive: true,
        initialCapital: 0,
        currentCash: 0
      }
    });
    
    console.log('Teacher created:', newTeacher.email);
  } else {
    console.log('\nTeacher exists. Updating password...');
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    await prisma.user.update({
      where: { email: 'teacher@example.com' },
      data: { 
        password: hashedPassword,
        isActive: true
      }
    });
    
    console.log('Teacher password updated');
  }
  
  // Also create/update student account
  const student = await prisma.user.findUnique({
    where: { email: 'student@example.com' }
  });
  
  if (!student) {
    console.log('\nCreating student account...');
    const hashedPassword = await bcrypt.hash('student123', 10);
    
    await prisma.user.create({
      data: {
        email: 'student@example.com',
        password: hashedPassword,
        name: 'Student',
        role: 'STUDENT',
        isActive: true,
        initialCapital: 10000000,
        currentCash: 10000000
      }
    });
    
    console.log('Student created');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });