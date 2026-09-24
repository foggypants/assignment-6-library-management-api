const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const validate = require('../middleware/validator');
const { createBookValidation, updateBookValidation } = require('../utils/validation');

router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);
router.post('/', auth, authorizeRoles('librarian'), createBookValidation, validate, bookController.createBook);
router.put('/:id', auth, authorizeRoles('librarian'), updateBookValidation, validate, bookController.updateBook);
router.delete('/:id', auth, authorizeRoles('librarian'), bookController.deleteBook);
router.post('/:id/borrow', auth, authorizeRoles('student'), bookController.borrowBook);
router.post('/:id/return', auth, authorizeRoles('student'), bookController.returnBook);

module.exports = router;
