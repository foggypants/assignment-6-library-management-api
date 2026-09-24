const bookModel = require('../models/bookModel');
const transactionModel = require('../models/transactionModel');

const getAllBooks = async (req, res) => {
  try {
    const { category, status, author } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (author) filters.author = author;

    const books = await bookModel.findAll(filters);
    return res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
};

const searchBooks = async (req, res) => {
  try {
    const query = req.query.q || req.query.title || req.query.author || '';
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search term' });
    }

    const books = await bookModel.search(query);
    return res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await bookModel.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch book', error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity, status } = req.body;
    const newBook = await bookModel.create({
      title,
      author,
      isbn,
      category,
      quantity: parseInt(quantity, 10) || 1,
      status: status || 'available'
    });

    return res.status(201).json({ success: true, message: 'Book created successfully', data: newBook });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create book', error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const existing = await bookModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const updatedBook = await bookModel.update(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const existing = await bookModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await bookModel.delete(req.params.id);
    return res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete book', error: error.message });
  }
};

const borrowBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.userId;

    const book = await bookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.quantity <= 0 || book.status === 'borrowed') {
      return res.status(400).json({ success: false, message: 'Book is currently unavailable' });
    }

    const activeBorrow = await transactionModel.findActiveBorrow(userId, bookId);
    if (activeBorrow) {
      return res.status(400).json({ success: false, message: 'You already borrowed this book' });
    }

    const newQuantity = book.quantity - 1;
    await bookModel.update(bookId, {
      quantity: newQuantity,
      status: newQuantity > 0 ? 'available' : 'borrowed'
    });

    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const transaction = await transactionModel.create({
      userId,
      userName: req.user.name,
      bookId,
      bookTitle: book.title,
      type: 'borrow',
      borrowDate: new Date().toISOString(),
      dueDate,
      status: 'active'
    });

    return res.status(200).json({
      success: true,
      message: `Borrowed '${book.title}' successfully`,
      data: { transaction, remainingQuantity: newQuantity, dueDate }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to borrow book', error: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.userId;

    const book = await bookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const activeBorrow = await transactionModel.findActiveBorrow(userId, bookId);
    if (!activeBorrow) {
      return res.status(400).json({ success: false, message: 'No active borrow record found for this book' });
    }

    const newQuantity = book.quantity + 1;
    await bookModel.update(bookId, {
      quantity: newQuantity,
      status: 'available'
    });

    const returnDate = new Date().toISOString();
    const isOverdue = new Date(returnDate) > new Date(activeBorrow.dueDate);
    const updatedTransaction = await transactionModel.update(activeBorrow.transactionId, {
      type: 'return',
      returnDate,
      status: isOverdue ? 'overdue' : 'returned'
    });

    return res.status(200).json({
      success: true,
      message: `Returned '${book.title}' successfully`,
      data: { transaction: updatedTransaction, isOverdue }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to return book', error: error.message });
  }
};

module.exports = {
  getAllBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};
