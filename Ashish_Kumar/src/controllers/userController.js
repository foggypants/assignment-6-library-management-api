const userModel = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password: _, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const existingUser = await userModel.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await userModel.update(req.params.id, { role });
    const { password: _, ...safeUser } = updatedUser;
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const existingUser = await userModel.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.userId === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await userModel.delete(req.params.id);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
