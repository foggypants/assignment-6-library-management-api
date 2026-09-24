const transactionModel = require('../models/transactionModel');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.findAll();
    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.findByUserId(req.user.userId);
    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getMyTransactions
};
