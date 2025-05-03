const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    createCategory,
    getCategoryTree,
    updateCategory,
    deleteCategory,
    getCategoryStats
} = require('../controllers/categoryController');

router.get('/tree', getCategoryTree);

// Routes protégées
router.use(auth);
router.post('/', isAdmin, createCategory);
router.put('/:id', isAdmin, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);
router.get('/:id/stats', getCategoryStats);

module.exports = router;
