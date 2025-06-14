import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface InitializationResult {
  success: boolean;
  message: string;
  details?: any;
}

async function initialize(): Promise<InitializationResult> {
  try {
    console.log('🚀 Starting application initialization...');

    // Check if initialization is needed
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists, checking other requirements...');
    } else {
      // Create admin user
      console.log('📧 Creating admin user...');
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'Admin123!@#',
        10
      );

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'System Administrator',
          role: 'TEACHER',
          grade: null,
          class: 'ADMIN'
        }
      });

      // Create portfolio for admin
      await prisma.portfolio.create({
        data: {
          userId: admin.id,
          cashBalance: 10000000,
          totalValue: 10000000
        }
      });

      console.log('✅ Admin user created successfully');
    }

    // Create initial stocks if needed
    const stockCount = await prisma.stock.count();
    if (stockCount === 0 && process.env.AUTO_CREATE_STOCKS !== 'false') {
      console.log('📈 Creating initial stock data...');
      
      const initialStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'NASDAQ', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ', sector: 'Consumer Cyclical' },
        { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ', sector: 'Automotive' },
        { symbol: 'META', name: 'Meta Platforms Inc.', market: 'NASDAQ', sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'NASDAQ', sector: 'Technology' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', market: 'NYSE', sector: 'Financial Services' },
        { symbol: 'V', name: 'Visa Inc.', market: 'NYSE', sector: 'Financial Services' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'NYSE', sector: 'Healthcare' }
      ];

      await prisma.stock.createMany({
        data: initialStocks,
        skipDuplicates: true
      });

      console.log(`✅ Created ${initialStocks.length} initial stocks`);
    } else {
      console.log(`✅ Stocks already exist (${stockCount} stocks found)`);
    }

    // Create portfolios for users without one
    const usersWithoutPortfolio = await prisma.user.findMany({
      where: {
        portfolio: null
      }
    });

    if (usersWithoutPortfolio.length > 0) {
      console.log(`💼 Creating portfolios for ${usersWithoutPortfolio.length} users...`);
      
      for (const user of usersWithoutPortfolio) {
        await prisma.portfolio.create({
          data: {
            userId: user.id,
            cashBalance: user.role === 'TEACHER' ? 10000000 : 1000000,
            totalValue: user.role === 'TEACHER' ? 10000000 : 1000000
          }
        });
      }

      console.log('✅ All users now have portfolios');
    }

    // Create demo student accounts if no students exist
    const studentCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    if (studentCount === 0 && process.env.CREATE_DEMO_STUDENTS === 'true') {
      console.log('👥 Creating demo student accounts...');
      
      const demoStudents = [
        { email: 'student1@example.com', name: '김철수', grade: 1, class: 'A' },
        { email: 'student2@example.com', name: '이영희', grade: 1, class: 'A' },
        { email: 'student3@example.com', name: '박민수', grade: 2, class: 'B' }
      ];

      const hashedPassword = await bcrypt.hash('Student123!', 10);

      for (const student of demoStudents) {
        const user = await prisma.user.create({
          data: {
            ...student,
            password: hashedPassword,
            role: 'STUDENT'
          }
        });

        await prisma.portfolio.create({
          data: {
            userId: user.id,
            cashBalance: 1000000,
            totalValue: 1000000
          }
        });
      }

      console.log(`✅ Created ${demoStudents.length} demo student accounts`);
    }

    // Verify database state
    const finalStats = {
      users: await prisma.user.count(),
      stocks: await prisma.stock.count(),
      portfolios: await prisma.portfolio.count(),
      transactions: await prisma.transaction.count()
    };

    console.log('\n📊 Final database state:');
    console.log(`   Users: ${finalStats.users}`);
    console.log(`   Stocks: ${finalStats.stocks}`);
    console.log(`   Portfolios: ${finalStats.portfolios}`);
    console.log(`   Transactions: ${finalStats.transactions}`);

    return {
      success: true,
      message: 'Initialization completed successfully',
      details: finalStats
    };

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    return {
      success: false,
      message: 'Initialization failed',
      details: error
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization if called directly
if (require.main === module) {
  initialize()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Initialization completed successfully!');
        process.exit(0);
      } else {
        console.error('\n❌ Initialization failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    });
}

export default initialize;