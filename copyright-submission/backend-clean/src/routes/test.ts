import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
        
    const result = await authService.login({ email, password });
        
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
            res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

export default router;