import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  const email = 'admin@example.com';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log(`사용자를 찾을 수 없습니다: ${email}`);
      return;
    }
    
    // 관련된 데이터 삭제 (cascade delete가 설정되지 않은 경우)
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    });
    
    await prisma.holding.deleteMany({
      where: { userId: user.id },
    });
    
    await prisma.portfolio.deleteMany({
      where: { userId: user.id },
    });
    
    // 사용자 삭제
    await prisma.user.delete({
      where: { email },
    });
    
    console.log(`사용자가 삭제되었습니다: ${email}`);
    
    // 남은 사용자 목록 표시
    const remainingUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        role: 'asc',
      },
    });
    
    console.log('\n=== 남은 사용자 목록 ===');
    remainingUsers.forEach(user => {
      console.log(`${user.email} - ${user.name} (${user.role})`);
    });
    
  } catch (error) {
    console.error('사용자 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();