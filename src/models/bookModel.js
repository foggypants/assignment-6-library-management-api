const { db } = require('../config/firebase');

const collection = db.collection('books');

const bookModel = {
  async create(bookData) {
    const docRef = collection.doc();
    const quantity = parseInt(bookData.quantity, 10) || 1;
    const newBook = {
      bookId: docRef.id,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn.trim(),
      category: bookData.category.trim(),
      status: quantity > 0 ? (bookData.status || 'available') : 'borrowed',
      quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await docRef.set(newBook);
    return newBook;
  },

  async findById(bookId) {
    const doc = await collection.doc(bookId).get();
    if (!doc.exists) return null;
    return { ...doc.data(), bookId: doc.id };
  },

  async findAll(filters = {}) {
    let query = collection;
    if (filters.category) query = query.where('category', '==', filters.category);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.author) query = query.where('author', '==', filters.author);

    const snapshot = await query.get();
    const books = [];
    snapshot.forEach(doc => books.push({ ...doc.data(), bookId: doc.id }));
    return books;
  },

  async search(searchTerm) {
    const snapshot = await collection.get();
    const books = [];
    const term = searchTerm.toLowerCase();

    snapshot.forEach(doc => {
      const data = doc.data();
      const match = (data.title && data.title.toLowerCase().includes(term)) ||
                    (data.author && data.author.toLowerCase().includes(term)) ||
                    (data.category && data.category.toLowerCase().includes(term));
      if (match) books.push({ ...data, bookId: doc.id });
    });
    return books;
  },

  async update(bookId, updateData) {
    const existing = await this.findById(bookId);
    if (!existing) return null;

    const quantity = updateData.quantity !== undefined ? parseInt(updateData.quantity, 10) : existing.quantity;
    let status = updateData.status || existing.status;
    if (quantity <= 0) {
      status = 'borrowed';
    } else if (quantity > 0 && !updateData.status) {
      status = 'available';
    }

    const updatedFields = {
      ...updateData,
      quantity,
      status,
      updatedAt: new Date().toISOString()
    };

    await collection.doc(bookId).set(updatedFields, { merge: true });
    return this.findById(bookId);
  },

  async delete(bookId) {
    await collection.doc(bookId).delete();
    return true;
  }
};

module.exports = bookModel;
