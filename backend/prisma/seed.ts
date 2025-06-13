import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: teacherPassword,
      name: '김선생',
      role: UserRole.TEACHER,
    },
  });

  console.log('Created teacher:', teacher.email);

  // Create sample class
  const sampleClass = await prisma.class.upsert({
    where: { code: 'MATH01' },
    update: {},
    create: {
      name: '경제수학 1반',
      code: 'MATH01',
      teacherId: teacher.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  console.log('Created class:', sampleClass.name);

  // Create sample stocks
  const stocks = [
    { symbol: '005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자', currentPrice: 75000, previousClose: 74500, marketCap: BigInt('450000000000000') },
    { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '전기전자', currentPrice: 135000, previousClose: 134000, marketCap: BigInt('98000000000000') },
    { symbol: '035720', name: '카카오', market: 'KOSPI', sector: 'IT', currentPrice: 58000, previousClose: 57500, marketCap: BigInt('25000000000000') },
    { symbol: '035420', name: 'NAVER', market: 'KOSPI', sector: 'IT', currentPrice: 215000, previousClose: 213000, marketCap: BigInt('35000000000000') },
    { symbol: '005380', name: '현대자동차', market: 'KOSPI', sector: '자동차', currentPrice: 185000, previousClose: 183000, marketCap: BigInt('39000000000000') },
    { symbol: '051910', name: 'LG화학', market: 'KOSPI', sector: '화학', currentPrice: 480000, previousClose: 475000, marketCap: BigInt('34000000000000') },
    { symbol: '006400', name: '삼성SDI', market: 'KOSPI', sector: '전기전자', currentPrice: 430000, previousClose: 428000, marketCap: BigInt('30000000000000') },
    { symbol: '003670', name: '포스코', market: 'KOSPI', sector: '철강', currentPrice: 265000, previousClose: 263000, marketCap: BigInt('23000000000000') },
    { symbol: '105560', name: 'KB금융', market: 'KOSPI', sector: '금융', currentPrice: 52000, previousClose: 51500, marketCap: BigInt('21000000000000') },
    { symbol: '055550', name: '신한지주', market: 'KOSPI', sector: '금융', currentPrice: 38000, previousClose: 37800, marketCap: BigInt('20000000000000') },
    { symbol: '096770', name: '에스티팜', market: 'KOSDAQ', sector: '제약', currentPrice: 45000, previousClose: 44500, marketCap: BigInt('3500000000000') },
    { symbol: '263750', name: '펄어비스', market: 'KOSDAQ', sector: '게임', currentPrice: 35000, previousClose: 34800, marketCap: BigInt('2000000000000') },
    { symbol: '293490', name: '카카오게임즈', market: 'KOSDAQ', sector: '게임', currentPrice: 28000, previousClose: 27500, marketCap: BigInt('2400000000000') },
    { symbol: '041510', name: '에스엠', market: 'KOSDAQ', sector: '엔터테인먼트', currentPrice: 85000, previousClose: 84000, marketCap: BigInt('2000000000000') },
    { symbol: '112040', name: '위메이드', market: 'KOSDAQ', sector: '게임', currentPrice: 42000, previousClose: 41500, marketCap: BigInt('1500000000000') },
  ];

  for (const stockData of stocks) {
    const stock = await prisma.stock.upsert({
      where: { symbol: stockData.symbol },
      update: {
        currentPrice: stockData.currentPrice,
        previousClose: stockData.previousClose,
      },
      create: stockData,
    });
    console.log('Created/Updated stock:', stock.symbol, stock.name);
  }

  // Set allowed stocks for the sample class (first 5 stocks)
  const stocksToAllow = await prisma.stock.findMany({
    take: 5,
    orderBy: { marketCap: 'desc' },
  });

  for (const stock of stocksToAllow) {
    await prisma.allowedStock.upsert({
      where: {
        classId_stockId: {
          classId: sampleClass.id,
          stockId: stock.id,
        },
      },
      update: {},
      create: {
        classId: sampleClass.id,
        stockId: stock.id,
        addedBy: teacher.id,
      },
    });
  }

  console.log(`Added ${stocksToAllow.length} stocks to class ${sampleClass.name}`);

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [
    { email: 'student1@example.com', name: '학생1' },
    { email: 'student2@example.com', name: '학생2' },
    { email: 'student3@example.com', name: '학생3' },
  ];

  for (const studentData of students) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        password: studentPassword,
        role: UserRole.STUDENT,
        classId: sampleClass.id,
      },
    });
    console.log('Created student:', student.email);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });