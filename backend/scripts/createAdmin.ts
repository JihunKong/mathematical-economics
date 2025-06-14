import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const password = 'alsk2004A!@#';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'purusil55@gmail.com' },
      update: {
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
      create: {
        email: 'purusil55@gmail.com',
        password: hashedPassword,
        name: '관리자',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    
    console.log('Admin user created/updated:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();