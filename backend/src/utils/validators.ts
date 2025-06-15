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
        // Class code is required for students, optional for teachers
        if (req.body.role === 'TEACHER' || !req.body.role) {
          return true; // Teachers don't need class code, and default role is STUDENT
        }
        // For students, class code is required
        if (!value || value.trim().length === 0) {
          throw new Error('Class code is required for students');
        }
        if (value.trim().length < 6 || value.trim().length > 10) {
          throw new Error('Class code must be between 6 and 10 characters');
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
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
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
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
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