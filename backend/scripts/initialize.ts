import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
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
    const adminEmail = process.env.ADMIN_EMAIL || 'purusil55@gmail.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists, checking other requirements...');
    } else {
      // Create admin user
      console.log('📧 Creating admin user...');
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'alsk2004A!@#',
        10
      );

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'System Administrator',
          role: UserRole.ADMIN,
          isActive: true,
          initialCapital: 0,
          currentCash: 0
        }
      });

      // Create portfolio for admin
      await prisma.portfolio.create({
        data: {
          userId: admin.id,
          totalValue: 0,
          totalCost: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0
        }
      });

      console.log(`✅ Admin user created successfully (${adminEmail})`);
    }

    // Create initial stocks if needed
    const stockCount = await prisma.stock.count();
    if (stockCount === 0 && process.env.AUTO_CREATE_STOCKS !== 'false') {
      console.log('📈 Creating initial stock data...');
      
      const initialStocks = [
        { symbol: '005930', name: '삼성전자', nameEn: 'Samsung Electronics', shortName: '삼성전자', market: 'KOSPI', sector: 'IT', isTracked: true, currentPrice: 70000, previousClose: 69500 },
        { symbol: '000660', name: 'SK하이닉스', nameEn: 'SK Hynix', shortName: 'SK하이닉스', market: 'KOSPI', sector: 'IT', isTracked: true, currentPrice: 130000, previousClose: 129000 },
        { symbol: '035720', name: '카카오', nameEn: 'Kakao', shortName: '카카오', market: 'KOSPI', sector: 'IT', isTracked: true, currentPrice: 45000, previousClose: 44500 },
        { symbol: '035420', name: 'NAVER', nameEn: 'Naver', shortName: 'NAVER', market: 'KOSPI', sector: 'IT', isTracked: true, currentPrice: 220000, previousClose: 218000 },
        { symbol: '051910', name: 'LG화학', nameEn: 'LG Chem', shortName: 'LG화학', market: 'KOSPI', sector: '화학', isTracked: true, currentPrice: 450000, previousClose: 448000 },
        { symbol: '006400', name: '삼성SDI', nameEn: 'Samsung SDI', shortName: '삼성SDI', market: 'KOSPI', sector: '전기전자', isTracked: true, currentPrice: 380000, previousClose: 378000 },
        { symbol: '207940', name: '삼성바이오로직스', nameEn: 'Samsung BioLogics', shortName: '삼바이오', market: 'KOSPI', sector: '의약품', isTracked: true, currentPrice: 750000, previousClose: 745000 },
        { symbol: '000270', name: '기아', nameEn: 'Kia', shortName: '기아', market: 'KOSPI', sector: '운수장비', isTracked: true, currentPrice: 82000, previousClose: 81500 },
        { symbol: '005380', name: '현대차', nameEn: 'Hyundai Motor', shortName: '현대차', market: 'KOSPI', sector: '운수장비', isTracked: true, currentPrice: 185000, previousClose: 184000 },
        { symbol: '066570', name: 'LG전자', nameEn: 'LG Electronics', shortName: 'LG전자', market: 'KOSPI', sector: '전기전자', isTracked: true, currentPrice: 95000, previousClose: 94500 }
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
        portfolios: {
          none: {}
        }
      }
    });

    if (usersWithoutPortfolio.length > 0) {
      console.log(`💼 Creating portfolios for ${usersWithoutPortfolio.length} users...`);
      
      for (const user of usersWithoutPortfolio) {
        const initialCapital = user.role === UserRole.ADMIN ? 0 : 10000000;
        await prisma.portfolio.create({
          data: {
            userId: user.id,
            totalValue: initialCapital,
            totalCost: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0
          }
        });
      }

      console.log('✅ All users now have portfolios');
    }

    // Create demo teacher account if no teachers exist
    const teacherCount = await prisma.user.count({
      where: { role: UserRole.TEACHER }
    });

    if (teacherCount === 0) {
      console.log('👥 Creating demo teacher account...');
      
      const hashedPassword = await bcrypt.hash('teacher123!', 10);
      
      const teacher = await prisma.user.create({
        data: {
          email: 'teacher1@test.com',
          name: '김선생',
          password: hashedPassword,
          role: UserRole.TEACHER,
          isActive: true,
          initialCapital: 10000000,
          currentCash: 10000000
        }
      });

      await prisma.portfolio.create({
        data: {
          userId: teacher.id,
          totalValue: 10000000,
          totalCost: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0
        }
      });

      console.log('✅ Created demo teacher account (teacher1@test.com / teacher123!)');
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