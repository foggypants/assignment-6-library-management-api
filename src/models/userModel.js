const { db } = require('../config/firebase');

const collection = db.collection('users');

const userModel = {
  async create(userData) {
    const docRef = collection.doc();
    const newUser = {
      userId: docRef.id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newUser);
    return newUser;
  },

  async findByEmail(email) {
    const snapshot = await collection.where('email', '==', email.toLowerCase()).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { ...doc.data(), userId: doc.id };
  },

  async findById(userId) {
    const doc = await collection.doc(userId).get();
    if (!doc.exists) return null;
    return { ...doc.data(), userId: doc.id };
  },

  async findAll() {
    const snapshot = await collection.get();
    const users = [];
    snapshot.forEach(doc => {
      const { password, ...safeUser } = doc.data();
      users.push({ ...safeUser, userId: doc.id });
    });
    return users;
  },

  async update(userId, updateData) {
    const updatedFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await collection.doc(userId).set(updatedFields, { merge: true });
    return this.findById(userId);
  },

  async delete(userId) {
    await collection.doc(userId).delete();
    return true;
  }
};

module.exports = userModel;
