import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers['content-type'],
    });
    
    const result = await authService.login(req.body);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: '🔄 새로고침 토큰이 필요합니다.\n\n' +
          '💡 다시 로그인해주세요.',
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a production app, you might want to blacklist the token here
    res.status(200).json({
      success: true,
      message: '👋 로그아웃되었습니다. 안녕히 가세요!',
    });
  } catch (error) {
    next(error);
  }
};