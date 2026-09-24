const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const validate = require('../middleware/validator');
const { updateRoleValidation } = require('../utils/validation');

router.use(auth, authorizeRoles('librarian'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/role', updateRoleValidation, validate, userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;
