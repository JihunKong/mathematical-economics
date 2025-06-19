const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetExcessiveAllowedStocks() {
  try {
    console.log('50개 이상 허용 종목을 가진 클래스 확인 중...');
    
    // 각 클래스별로 허용된 종목 수 확인
    const classes = await prisma.class.findMany({
      include: {
        allowedStocks: {
          where: { isActive: true }
        }
      }
    });

    for (const classItem of classes) {
      const allowedCount = classItem.allowedStocks.length;
      
      if (allowedCount > 50) {
        console.log(`클래스 ${classItem.name} (${classItem.id}): ${allowedCount}개 종목 발견`);
        
        // 해당 클래스의 모든 허용 종목 비활성화
        await prisma.allowedStock.updateMany({
          where: {
            classId: classItem.id,
            isActive: true
          },
          data: {
            isActive: false
          }
        });
        
        console.log(`- ${classItem.name} 클래스의 모든 허용 종목을 초기화했습니다.`);
      } else {
        console.log(`클래스 ${classItem.name}: ${allowedCount}개 종목 (정상)`);
      }
    }
    
    console.log('\n처리 완료!');
    console.log('교사들에게 다시 50개 이하로 종목을 선택하도록 안내해주세요.');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
resetExcessiveAllowedStocks();