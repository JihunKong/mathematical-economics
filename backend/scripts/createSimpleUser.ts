import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSimpleUser() {
  try {
    // Create user with simple password
    const email = 'simple@example.com';
    const password = 'simple123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
      create: {
        email,
        password: hashedPassword,
        name: '심플유저',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    
    console.log('User created/updated:', user.email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleUser();