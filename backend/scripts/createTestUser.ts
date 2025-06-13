import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'purusil55@gmail.com';
    const password = 'alsk2004A!@#';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
      create: {
        email,
        password: hashedPassword,
        name: '공지훈',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    
    console.log('User created/updated:', user.email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    
    // Also create simpler test account
    const testPassword = 'test123';
    const testHashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: testHashedPassword,
        role: UserRole.STUDENT,
      },
      create: {
        email: 'test@example.com',
        password: testHashedPassword,
        name: '테스트',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });
    
    console.log('\nTest user created/updated:', testUser.email);
    console.log('Password:', testPassword);
    console.log('Role:', testUser.role);
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();