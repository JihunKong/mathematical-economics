#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

async function analyzeUsers() {
  console.log(`${colors.cyan}=== 사용자 계정 분석 시작 ===${colors.reset}\n`);

  const users = await prisma.user.findMany({
    include: {
      class: true,
      transactions: {
        select: { id: true }
      },
      holdings: {
        select: { id: true }
      },
      watchlist: {
        select: { id: true }
      }
    }
  });

  // 분석 데이터
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const teacherUsers = users.filter(u => u.role === 'TEACHER');
  const studentUsers = users.filter(u => u.role === 'STUDENT');
  const studentsWithoutClass = studentUsers.filter(u => !u.classId);
  const teachersWithoutClass = teacherUsers.filter(u => {
    return !users.some(student => student.classId === u.id);
  });
  
  // 30일 이상 업데이트 없는 계정
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const inactiveUsers = users.filter(u => 
    u.updatedAt && u.updatedAt < thirtyDaysAgo && u.role !== 'ADMIN'
  );

  // 분석 결과 출력
  console.log(`${colors.blue}전체 사용자 통계:${colors.reset}`);
  console.log(`- 총 사용자: ${users.length}명`);
  console.log(`- 관리자: ${adminUsers.length}명`);
  console.log(`- 교사: ${teacherUsers.length}명`);
  console.log(`- 학생: ${studentUsers.length}명\n`);

  console.log(`${colors.yellow}정리 대상 사용자:${colors.reset}`);
  console.log(`- 학급 없는 학생: ${studentsWithoutClass.length}명`);
  console.log(`- 담당 학생 없는 교사: ${teachersWithoutClass.length}명`);
  console.log(`- 30일 이상 미활동: ${inactiveUsers.length}명\n`);

  // 정리 대상 목록
  const toDelete = [
    ...studentsWithoutClass,
    ...teachersWithoutClass,
    ...inactiveUsers
  ];

  // 중복 제거
  const uniqueToDelete = Array.from(
    new Map(toDelete.map(u => [u.id, u])).values()
  );

  console.log(`${colors.magenta}정리 대상 상세:${colors.reset}`);
  uniqueToDelete.forEach(user => {
    const reasons = [];
    if (studentsWithoutClass.includes(user)) reasons.push('학급 없음');
    if (teachersWithoutClass.includes(user)) reasons.push('담당 학생 없음');
    if (inactiveUsers.includes(user)) reasons.push('30일 이상 미활동');
    
    console.log(`- ${user.email} (${user.role}) - ${reasons.join(', ')}`);
    console.log(`  거래: ${(user as any).transactions?.length || 0}건, 보유종목: ${(user as any).holdings?.length || 0}개, 관심종목: ${(user as any).watchlist?.length || 0}개`);
  });

  console.log(`\n${colors.green}보호되는 계정:${colors.reset}`);
  adminUsers.forEach(admin => {
    console.log(`- ${admin.email} (ADMIN)`);
  });

  return {
    total: users.length,
    toDelete: uniqueToDelete,
    adminUsers
  };
}

async function deleteUsers(userIds: string[]) {
  console.log(`\n${colors.red}=== 사용자 삭제 시작 ===${colors.reset}`);
  
  let deletedCount = 0;
  let errorCount = 0;

  for (const userId of userIds) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true }
      });

      if (!user) continue;

      // 관련 데이터 삭제 (cascade)
      await prisma.$transaction(async (tx) => {
        // 거래 내역 삭제
        await tx.transaction.deleteMany({
          where: { userId }
        });

        // 보유 종목 삭제
        await tx.holding.deleteMany({
          where: { userId }
        });

        // 포트폴리오 삭제
        await tx.portfolio.deleteMany({
          where: { userId }
        });

        // 관심종목 삭제
        await tx.watchlist.deleteMany({
          where: { userId }
        });

        // 사용자 삭제
        await tx.user.delete({
          where: { id: userId }
        });
      });

      console.log(`${colors.green}✓${colors.reset} ${user.email} (${user.role}) 삭제 완료`);
      deletedCount++;
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset} 사용자 삭제 실패:`, error);
      errorCount++;
    }
  }

  console.log(`\n${colors.cyan}삭제 완료: ${deletedCount}명 성공, ${errorCount}명 실패${colors.reset}`);
}

async function main() {
  try {
    console.clear();
    console.log(`${colors.cyan}
╔═══════════════════════════════════════════╗
║     자동 사용자 계정 정리 스크립트       ║
╚═══════════════════════════════════════════╝
${colors.reset}`);

    // 사용자 분석
    const { toDelete } = await analyzeUsers();

    if (toDelete.length === 0) {
      console.log(`\n${colors.green}정리할 계정이 없습니다.${colors.reset}`);
      process.exit(0);
    }

    // 명령행 인수로 자동 삭제 여부 확인
    const autoDelete = process.argv.includes('--auto') || process.argv.includes('-y');
    
    if (autoDelete) {
      console.log(`\n${colors.yellow}자동 모드: ${toDelete.length}개 계정을 삭제합니다...${colors.reset}`);
      await deleteUsers(toDelete.map(u => u.id));
      console.log(`\n${colors.green}계정 정리가 완료되었습니다.${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}삭제하려면 --auto 또는 -y 옵션을 사용하세요:${colors.reset}`);
      console.log(`npx ts-node scripts/cleanupUsers-auto.ts --auto`);
    }

  } catch (error) {
    console.error(`\n${colors.red}오류 발생:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}