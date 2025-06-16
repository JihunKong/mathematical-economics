const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStockPrice() {
  try {
    // 삼성전자 주식 정보 조회
    const samsungStock = await prisma.stock.findUnique({
      where: { symbol: '005930' }
    });
    
    if (!samsungStock) {
      console.log('❌ 삼성전자(005930)를 찾을 수 없습니다.');
      return;
    }
    
    console.log('📊 삼성전자 주식 정보:');
    console.log('- ID:', samsungStock.id);
    console.log('- Symbol:', samsungStock.symbol);
    console.log('- Name:', samsungStock.name);
    console.log('- Current Price:', samsungStock.currentPrice);
    console.log('- Previous Close:', samsungStock.previousClose);
    console.log('- Change:', samsungStock.change);
    console.log('- Change Percent:', samsungStock.changePercent);
    console.log('- Updated At:', samsungStock.updatedAt);
    
    // 학생 정보 확인
    const student = await prisma.user.findFirst({
      where: { 
        email: 'student1@test.com',
        role: 'STUDENT'
      },
      include: {
        class: {
          include: {
            allowedStocks: {
              where: {
                stockId: samsungStock.id
              }
            }
          }
        }
      }
    });
    
    if (student) {
      console.log('\n👤 학생 정보:');
      console.log('- Name:', student.name);
      console.log('- Current Cash:', student.currentCash);
      console.log('- Class:', student.class?.name);
      console.log('- Samsung allowed?:', student.class?.allowedStocks.length > 0 ? 'Yes' : 'No');
      
      // 거래 가능 여부 계산
      const quantity = 50;
      const totalCost = samsungStock.currentPrice * quantity;
      const commission = Math.round(totalCost * 0.00015);
      const totalAmount = totalCost + commission;
      
      console.log('\n💰 거래 계산:');
      console.log('- Quantity:', quantity);
      console.log('- Price per share:', samsungStock.currentPrice);
      console.log('- Total Cost:', totalCost);
      console.log('- Commission:', commission);
      console.log('- Total Amount:', totalAmount);
      console.log('- Student Cash:', student.currentCash);
      console.log('- Can Buy?:', student.currentCash >= totalAmount ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStockPrice();