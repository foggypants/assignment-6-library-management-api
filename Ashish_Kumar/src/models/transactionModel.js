const { db } = require('../config/firebase');

const collection = db.collection('transactions');

const transactionModel = {
  async create(txData) {
    const docRef = collection.doc();
    const newTransaction = {
      transactionId: docRef.id,
      userId: txData.userId,
      userName: txData.userName || '',
      bookId: txData.bookId,
      bookTitle: txData.bookTitle || '',
      type: txData.type || 'borrow',
      borrowDate: txData.borrowDate || new Date().toISOString(),
      returnDate: txData.returnDate || null,
      dueDate: txData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: txData.status || 'active'
    };
    await docRef.set(newTransaction);
    return newTransaction;
  },

  async findById(transactionId) {
    const doc = await collection.doc(transactionId).get();
    if (!doc.exists) return null;
    return { ...doc.data(), transactionId: doc.id };
  },

  async findAll() {
    const snapshot = await collection.get();
    const transactions = [];
    snapshot.forEach(doc => transactions.push({ ...doc.data(), transactionId: doc.id }));
    return transactions;
  },

  async findByUserId(userId) {
    const snapshot = await collection.where('userId', '==', userId).get();
    const transactions = [];
    snapshot.forEach(doc => transactions.push({ ...doc.data(), transactionId: doc.id }));
    return transactions;
  },

  async findActiveBorrow(userId, bookId) {
    const snapshot = await collection
      .where('userId', '==', userId)
      .where('bookId', '==', bookId)
      .where('status', '==', 'active')
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { ...doc.data(), transactionId: doc.id };
  },

  async update(transactionId, updateData) {
    await collection.doc(transactionId).set(updateData, { merge: true });
    return this.findById(transactionId);
  }
};

module.exports = transactionModel;
