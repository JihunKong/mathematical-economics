import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService'에러가 발생했습니다'🔄 새로고침 토큰이 필요합니다.\n\n' +
          '💡 다시 로그인해주세요.'에러가 발생했습니다'👋 로그아웃되었습니다. 안녕히 가세요!',
    });
  } catch (error) {
    next(error);
  }
};