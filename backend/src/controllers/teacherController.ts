import { Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacherService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const teacherService = new TeacherService();

// Create a new class
export const createClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can create classes', 403);
    }

    const teacherId = req.user.id;
    const newClass = await teacherService.createClass(teacherId, req.body);

    res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};

// Get teacher's classes
export const getTeacherClasses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can access this resource', 403);
    }

    const classes = await teacherService.getTeacherClasses(req.user.id);

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

// Get class details
export const getClassDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can access this resource', 403);
    }

    const { classId } = req.params;
    const classDetails = await teacherService.getClassDetails(classId, req.user.id);

    res.status(200).json({
      success: true,
      data: classDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Update allowed stocks for a class
export const updateAllowedStocks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can manage allowed stocks', 403);
    }

    const { classId } = req.params;
    const { stockIds } = req.body;

    if (!Array.isArray(stockIds)) {
      throw new AppError('stockIds must be an array', 400);
    }

    const updatedStocks = await teacherService.updateAllowedStocks(
      classId,
      req.user.id,
      stockIds
    );

    res.status(200).json({
      success: true,
      data: updatedStocks,
    });
  } catch (error) {
    next(error);
  }
};

// Get student activity
export const getStudentActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can view student activity', 403);
    }

    const { studentId } = req.params;
    const activity = await teacherService.getStudentActivity(studentId, req.user.id);

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// Get class statistics
export const getClassStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can view class statistics', 403);
    }

    const { classId } = req.params;
    const statistics = await teacherService.getClassStatistics(classId, req.user.id);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

// Update student's cash balance
export const updateStudentCash = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      throw new AppError('Only teachers can update student cash', 403);
    }

    const { studentId } = req.params;
    const { newCash } = req.body;

    if (typeof newCash !== 'number' || newCash < 0) {
      throw new AppError('Invalid cash amount', 400);
    }

    const updatedStudent = await teacherService.updateStudentCash(
      req.user.id,
      studentId,
      newCash
    );

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};