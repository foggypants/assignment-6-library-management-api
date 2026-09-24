const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'librarian']).withMessage('Role must be student or librarian')
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email')
];

const createBookValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateBookValidation = [
  body('title').optional().trim().notEmpty(),
  body('author').optional().trim().notEmpty(),
  body('isbn').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be 0 or higher'),
  body('status').optional().isIn(['available', 'borrowed']).withMessage('Status must be available or borrowed')
];

const updateRoleValidation = [
  body('role').notEmpty().isIn(['student', 'librarian']).withMessage('Role must be student or librarian')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  createBookValidation,
  updateBookValidation,
  updateRoleValidation
};
