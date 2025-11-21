import { prisma } from '../config/database';
import { hashPassword } from '../utils/encryption';
import { UserRole } from '@prisma/client';

async function createAdminUser() {
  try {
    const adminEmail = 'purusil55@gmail.com';
    const adminPassword = 'alsk2004A!@#';
    const adminName = 'System Administrator';

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
            return;
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: UserRole.ADMIN,
        isActive: true,
        initialCapital: 0,
        currentCash: 0,
      },
    });

    
  } catch (error) {
      } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();