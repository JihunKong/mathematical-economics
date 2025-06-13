import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Test login attempt:', email);
    
    const result = await authService.login({ email, password });
    console.log('Login successful for:', email);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    console.error('Stack:', error.stack);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

export default router;