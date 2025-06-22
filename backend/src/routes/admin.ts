import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// User management
router.get('/users/pending', adminController.getPendingUsers);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/approve', adminController.approveUser);
router.delete('/users/:userId/reject', adminController.rejectUser);
router.delete('/users/:userId/delete', adminController.deleteUser); // New comprehensive delete endpoint
router.put('/users/:userId/reset-password', adminController.resetUserPassword);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.post('/users/create-teacher', adminController.createTeacherAccount);

export default router;