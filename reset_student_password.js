const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetStudentPassword() {
  try {
    // 새 비밀번호 설정
    const newPassword = 'student123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // student1@test.com 사용자 찾기
    const student = await prisma.user.findUnique({
      where: { email: 'student1@test.com' }
    });
    
    if (!student) {
      console.log('❌ student1@test.com 사용자를 찾을 수 없습니다.');
      return;
    }
    
    // 비밀번호 업데이트
    await prisma.user.update({
      where: { email: 'student1@test.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ 비밀번호가 성공적으로 재설정되었습니다!');
    console.log('📧 이메일: student1@test.com');
    console.log('🔑 새 비밀번호: student123!');
    console.log('\n⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요.');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetStudentPassword();