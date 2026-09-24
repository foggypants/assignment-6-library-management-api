const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

router.get('/my', auth, transactionController.getMyTransactions);
router.get('/', auth, authorizeRoles('librarian'), transactionController.getAllTransactions);

module.exports = router;
