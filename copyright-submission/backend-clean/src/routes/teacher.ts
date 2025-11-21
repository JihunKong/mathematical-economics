import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';
import * as teacherController from '../controllers/teacherController';

const router = Router();


router.use(authenticate);
router.use(authorize('TEACHER', 'ADMIN'));

// Class management
router.post(
  '/classes',
  [
    body('name').trim().notEmpty().withMessage('Class name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  ],
  validate,
  teacherController.createClass
);

router.get('/classes', teacherController.getTeacherClasses);

router.get(
  '/classes/:classId',
  [param('classId'에러가 발생했습니다'/students/:studentId/activity',
  [param('studentId'에러가 발생했습니다'/classes/:classId/statistics',
  [param('classId'에러가 발생했습니다'/students/:studentId/cash',
  [
    param('studentId').notEmpty(),
    body('newCash')
      .isNumeric()
      .withMessage('Cash amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Cash amount must be positive'),
  ],
  validate,
  teacherController.updateStudentCash
);

export default router;