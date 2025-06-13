import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('사용법: npx ts-node scripts/updateUserRole.ts <이메일> <권한>');
    console.log('권한: STUDENT, TEACHER, ADMIN');
    console.log('예시: npx ts-node scripts/updateUserRole.ts user@example.com TEACHER');
    process.exit(1);
  }
  
  const [email, role] = args;
  
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    console.error('잘못된 권한입니다. STUDENT, TEACHER, ADMIN 중 하나를 선택하세요.');
    process.exit(1);
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.error(`사용자를 찾을 수 없습니다: ${email}`);
      process.exit(1);
    }
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: role as UserRole,
        isActive: true, // 권한 변경 시 활성화도 함께 설정
      },
    });
    
    console.log('사용자 권한이 업데이트되었습니다:');
    console.log('- 이메일:', updatedUser.email);
    console.log('- 이름:', updatedUser.name);
    console.log('- 이전 권한:', user.role);
    console.log('- 새 권한:', updatedUser.role);
    console.log('- 활성 상태:', updatedUser.isActive ? '활성' : '비활성');
    
  } catch (error) {
    console.error('권한 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();