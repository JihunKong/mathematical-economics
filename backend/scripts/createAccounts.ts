import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAccounts() {
  try {
    // 교사 계정 생성
    const teacherEmail = 'teacher@example.com';
    const teacherPassword = 'teacher123';
    const teacherHashedPassword = await bcrypt.hash(teacherPassword, 10);
    
    const teacher = await prisma.user.upsert({
      where: { email: teacherEmail },
      update: {
        password: teacherHashedPassword,
        role: UserRole.TEACHER,
        isActive: true,
      },
      create: {
        email: teacherEmail,
        password: teacherHashedPassword,
        name: '김선생',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });
    
    console.log('교사 계정 생성/업데이트 완료:');
    console.log('- 이메일:', teacher.email);
    console.log('- 비밀번호:', teacherPassword);
    console.log('- 이름:', teacher.name);
    console.log('- 권한:', teacher.role);
    console.log('');
    
    // 관리자 계정 생성
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminHashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
      create: {
        email: adminEmail,
        password: adminHashedPassword,
        name: '관리자',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    
    console.log('관리자 계정 생성/업데이트 완료:');
    console.log('- 이메일:', admin.email);
    console.log('- 비밀번호:', adminPassword);
    console.log('- 이름:', admin.name);
    console.log('- 권한:', admin.role);
    console.log('');
    
    // 학생 계정 생성
    const studentEmail = 'student@example.com';
    const studentPassword = 'student123';
    const studentHashedPassword = await bcrypt.hash(studentPassword, 10);
    
    const student = await prisma.user.upsert({
      where: { email: studentEmail },
      update: {
        password: studentHashedPassword,
        role: UserRole.STUDENT,
        isActive: true,
      },
      create: {
        email: studentEmail,
        password: studentHashedPassword,
        name: '홍길동',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });
    
    console.log('학생 계정 생성/업데이트 완료:');
    console.log('- 이메일:', student.email);
    console.log('- 비밀번호:', studentPassword);
    console.log('- 이름:', student.name);
    console.log('- 권한:', student.role);
    console.log('');
    
    // 모든 사용자 목록 출력
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('=== 전체 사용자 목록 ===');
    allUsers.forEach(user => {
      console.log(`${user.email} - ${user.name} (${user.role}) - 활성: ${user.isActive ? 'O' : 'X'}`);
    });
    
  } catch (error) {
    console.error('계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();