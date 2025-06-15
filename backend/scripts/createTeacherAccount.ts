import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface TeacherAccount {
  email: string;
  password: string;
  name: string;
}

async function createTeacherAccounts() {
  try {
    console.log('🎓 Creating teacher accounts...');

    const teachers: TeacherAccount[] = [
      {
        email: 'teacher@matheconomics.com',
        password: 'Teacher123!',
        name: '김선생님'
      },
      {
        email: 'teacher2@matheconomics.com', 
        password: 'Teacher123!',
        name: '이선생님'
      },
      {
        email: 'demo.teacher@matheconomics.com',
        password: 'DemoTeacher123!',
        name: 'Demo Teacher'
      }
    ];

    for (const teacher of teachers) {
      try {
        // Check if teacher already exists
        const existing = await prisma.user.findUnique({
          where: { email: teacher.email }
        });

        if (existing) {
          console.log(`✅ Teacher ${teacher.email} already exists`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(teacher.password, 10);

        // Create teacher account
        const user = await prisma.user.create({
          data: {
            email: teacher.email,
            password: hashedPassword,
            name: teacher.name,
            role: UserRole.TEACHER,
            isActive: true,
            initialCapital: 0,
            currentCash: 0
          }
        });

        // Create portfolio for teacher
        await prisma.portfolio.create({
          data: {
            userId: user.id,
            totalValue: 0,
            totalCost: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0
          }
        });

        console.log(`✅ Created teacher account: ${teacher.email}`);
        console.log(`   Password: ${teacher.password}`);
        console.log(`   Name: ${teacher.name}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error creating teacher ${teacher.email}:`, error);
      }
    }

    // Also create a demo class for testing
    console.log('\n📚 Creating demo class...');
    
    const demoTeacher = await prisma.user.findUnique({
      where: { email: 'demo.teacher@matheconomics.com' }
    });

    if (demoTeacher) {
      const existingClass = await prisma.class.findFirst({
        where: { 
          teacherId: demoTeacher.id,
          name: 'Demo Class'
        }
      });

      if (!existingClass) {
        const demoClass = await prisma.class.create({
          data: {
            name: 'Demo Class',
            code: 'DEMO2025',
            teacherId: demoTeacher.id,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true
          }
        });

        console.log(`✅ Created demo class: ${demoClass.name}`);
        console.log(`   Class Code: ${demoClass.code}`);
        console.log(`   Teacher: ${demoTeacher.name}`);
      } else {
        console.log('✅ Demo class already exists');
      }
    }

    console.log('\n🎉 Teacher account setup completed!');
    console.log('\nYou can now login with these accounts on the EC2 deployment.');

  } catch (error) {
    console.error('❌ Error in teacher account setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTeacherAccounts();