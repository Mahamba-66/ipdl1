const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    addBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

router.get('/search', getBooks);
router.get('/:id', getBookById);

// Routes protégées
router.use(auth);
router.post('/', isAdmin, addBook);
router.put('/:id', isAdmin, updateBook);
router.delete('/:id', isAdmin, deleteBook);

module.exports = router;
