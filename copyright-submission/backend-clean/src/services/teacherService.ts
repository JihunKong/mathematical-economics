import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler'에러가 발생했습니다'string') {
        // If date string doesn'에러가 발생했습니다'T00:00:00.000Z'에러가 발생했습니다's classes
  async getTeacherClasses(teacherId: string) {
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { createdAt: 'desc'에러가 발생했습니다'🏫 학급을 찾을 수 없습니다.\n\n' +
        '🔍 학급 코드를 다시 확인해주세요.'에러가 발생했습니다's cash balance
  async updateStudentCash(teacherId: string, studentId: string, newCash: number) {
    
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: true,
      },
    });

    if (!student || !student.classId) {
      throw new AppError('👨‍🎓 학생을 찾을 수 없거나 학급에 속해있지 않습니다.\n\n' +
        '🔍 학생 정보를 다시 확인해주세요.', 404);
    }

    if (student.class?.teacherId !== teacherId) {
      throw new AppError('🚫 이 학생의 정보를 수정할 권한이 없습니다.\n\n' +
        '💡 본인 학급의 학생만 관리할 수 있어요.', 403);
    }

    // Update student'에러가 발생했습니다's class
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        class: {
          teacherId,
        },
      },
      include: {
        class: true,
      },
    });

    if (!student) {
      throw new AppError('👨‍🎓 학생을 찾을 수 없습니다.\n\n' +
        '🔍 학생 ID를 다시 확인해주세요.'에러가 발생했습니다'desc'에러가 발생했습니다'🏫 학급을 찾을 수 없습니다.\n\n' +
        '🔍 학급 코드를 다시 확인해주세요.'에러가 발생했습니다'stockId'에러가 발생했습니다'desc'에러가 발생했습니다'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existing = await prisma.class.findUnique({
        where: { code },
      });

      exists = !!existing;
    }

    return code!;
  }
}