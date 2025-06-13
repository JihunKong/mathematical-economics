import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';
import * as teacherController from '../controllers/teacherController';

const router = Router();

// All teacher routes require authentication and teacher role
router.use(authenticate);
router.use(authorize('TEACHER'));

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
  [param('classId').notEmpty()],
  validate,
  teacherController.getClassDetails
);

// Stock management
router.put(
  '/classes/:classId/stocks',
  [
    param('classId').notEmpty(),
    body('stockIds').isArray().withMessage('stockIds must be an array'),
    body('stockIds.*').isString().withMessage('Each stockId must be a string'),
  ],
  validate,
  teacherController.updateAllowedStocks
);

// Student monitoring
router.get(
  '/students/:studentId/activity',
  [param('studentId').notEmpty()],
  validate,
  teacherController.getStudentActivity
);

// Class statistics
router.get(
  '/classes/:classId/statistics',
  [param('classId').notEmpty()],
  validate,
  teacherController.getClassStatistics
);

// Update student cash
router.patch(
  '/students/:studentId/cash',
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