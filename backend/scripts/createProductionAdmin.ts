import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/encryption';

// Use production database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mathuser:mathpass123@localhost:5432/mathematical_economics';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function createProductionAdminUser() {
  try {
    const adminEmail = 'purusil55@gmail.com';
    const adminPassword = 'alsk2004A!@#';
    const adminName = 'System Administrator';

    console.log('Connecting to database:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('User details:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive,
      });
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

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createProductionAdminUser();