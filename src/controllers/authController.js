const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    const token = generateToken({
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role
    });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: safeUser, token }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, token }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (email) {
      const existing = await userModel.findByEmail(email);
      if (existing && existing.userId !== req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
      updateData.email = email.toLowerCase().trim();
    }

    const updatedUser = await userModel.update(req.user.userId, updateData);
    const { password: _, ...safeUser } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
