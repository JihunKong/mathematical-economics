import { body, param, query } from 'express-validator';

export const authValidators = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('role')
      .optional()
      .isIn(['STUDENT', 'TEACHER'])
      .withMessage('Role must be either STUDENT or TEACHER'),
    body('classCode')
      .optional()
      .custom((value, { req }) => {
        
        if (req.body.role === 'TEACHER'에러가 발생했습니다'Class code is required for students'에러가 발생했습니다'Class code must be between 6 and 10 characters');
        }
        return true;
      }),
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
};

export const tradingValidators = {
  buy: [
    body('symbol')
      .trim()
      .notEmpty()
      .withMessage('Stock symbol is required'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('투자 판단 근거는 3자 이상 500자 이하로 입력해주세요'),
  ],
  
  sell: [
    body('symbol')
      .trim()
      .notEmpty()
      .withMessage('Stock symbol is required'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('투자 판단 근거는 3자 이상 500자 이하로 입력해주세요'),
  ],
};

export const stockValidators = {
  getBySymbol: [
    param('symbol')
      .trim()
      .notEmpty()
      .withMessage('Stock symbol is required'),
  ],
  
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Search query must not be empty'),
    query('market')
      .optional()
      .isIn(['KOSPI', 'KOSDAQ'])
      .withMessage('Market must be either KOSPI or KOSDAQ'),
  ],
};