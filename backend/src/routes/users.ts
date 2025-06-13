import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented
router.get('/profile', (_req, res) => {
  res.json({ message: 'Get user profile - to be implemented' });
});

router.put('/profile', (_req, res) => {
  res.json({ message: 'Update user profile - to be implemented' });
});

router.get('/stats', (_req, res) => {
  res.json({ message: 'Get user statistics - to be implemented' });
});

export default router;