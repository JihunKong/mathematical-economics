// Direct teacher creation script for immediate use
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create teacher password hash
    const hashedPassword = await bcrypt.hash('teacher123!', 10);
    
    // Check if teacher exists
    const existing = await prisma.user.findUnique({
      where: { email: 'teacher@test.com' }
    });
    
    if (existing) {
      // Update existing user to teacher
      const updated = await prisma.user.update({
        where: { email: 'teacher@test.com' },
        data: { 
          role: 'TEACHER',
          isActive: true,
          name: '테스트 교사'
        }
      });
      console.log('Updated existing user to teacher:', updated.email);
    } else {
      // Create new teacher
      const teacher = await prisma.user.create({
        data: {
          email: 'teacher@test.com',
          password: hashedPassword,
          name: '테스트 교사',
          role: 'TEACHER',
          isActive: true,
          initialCapital: 10000000,
          currentCash: 10000000
        }
      });
      console.log('Created teacher:', teacher.email);
    }
    
    console.log('\n✅ Teacher account ready!');
    console.log('Email: teacher@test.com');
    console.log('Password: teacher123!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();